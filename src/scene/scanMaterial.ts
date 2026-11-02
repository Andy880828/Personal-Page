import { Color, DoubleSide, ShaderMaterial, UniformsLib, UniformsUtils } from 'three';

/**
 * 「被聲納掃出來」的材質：海床等深線的同一套語言，套在所有生物與礁岩上。
 * - 本體是接近水色的暗剪影（霧會把它吃進背景）
 * - 輪廓光（fresnel）勾出外形
 * - 沿世界高度取模的細線（fwidth 抗鋸齒），像等深線掃過物體
 * 不吃場景燈光：深海裡物體本來就看不到顏色，只有輪廓與回波。
 * 魚可以開 SWAY：沿身體軸往尾巴越擺越大（頭朝 -x 或 +z）。
 */
export interface ScanOptions {
  /** 剪影本體色 */
  base?: string;
  /** 輪廓與掃描線色 */
  line?: string;
  /** 掃描線間距（世界單位） */
  spacing?: number;
  /** 掃描線強度 0–1 */
  lines?: number;
  opacity?: number;
  sway?: { axis: [number, number]; head: 'x-' | 'z+' };
}

const vert = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
uniform float uTime;
uniform vec2 uAxis;
varying vec3 vN;
varying vec3 vView;
varying vec3 vWorld;
void main() {
  vec3 p = position;
#ifdef SWAY
  float t = clamp((p.SWAY_ALONG - uAxis.x) / (uAxis.y - uAxis.x), 0.0, 1.0);
  float tl = SWAY_TAIL;
  p.SWAY_SIDE += sin(uTime * 7.0 - tl * 5.0) * (uAxis.y - uAxis.x) * 0.07 * tl * tl;
#endif
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
  vN = normalize(normalMatrix * normal);
  vView = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const frag = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uBase;
uniform vec3 uLine;
uniform float uSpacing;
uniform float uLines;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vView;
varying vec3 vWorld;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vView);
  float facing = abs(dot(n, v));
  float rim = pow(1.0 - facing, 2.4);
  float h = vWorld.y / uSpacing;
  float line = 1.0 - min(abs(fract(h - 0.5) - 0.5) / max(fwidth(h), 1e-4), 1.0);
  vec3 c = uBase * (0.55 + 0.45 * facing) + uLine * (rim * 0.85 + line * uLines * (0.35 + 0.65 * rim));
  gl_FragColor = vec4(c, uOpacity * (0.75 + 0.25 * rim));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export function scanMaterial(o: ScanOptions = {}) {
  const defines: Record<string, string> = {};
  if (o.sway) {
    defines.SWAY = '';
    defines.SWAY_ALONG = o.sway.head === 'x-' ? 'x' : 'z';
    defines.SWAY_SIDE = o.sway.head === 'x-' ? 'z' : 'x';
    defines.SWAY_TAIL = o.sway.head === 'x-' ? 't' : '(1.0 - t)';
  }
  const transparent = (o.opacity ?? 1) < 1;
  return new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    defines,
    fog: true,
    transparent,
    depthWrite: !transparent,
    side: DoubleSide,
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uTime: { value: 0 },
        uAxis: { value: o.sway?.axis ?? [0, 1] },
        uBase: { value: new Color(o.base ?? '#0b2a3d') },
        uLine: { value: new Color(o.line ?? '#4ff0d2') },
        uSpacing: { value: o.spacing ?? 0.12 },
        uLines: { value: o.lines ?? 0.6 },
        uOpacity: { value: o.opacity ?? 1 },
      },
    ]),
  });
}
