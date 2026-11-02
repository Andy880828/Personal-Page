import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { sceneTime } from './time';
import { evenPos, sunlight } from './path';
import { smoothstep } from '@/lib/math';
import { GLYPH_GRID, glyphAtlas, SNOW_GLYPHS } from './glyphs';

const BOX = [44, 36, 44] as const;

const vert = /* glsl */ `
uniform float uTime;
uniform vec3 uBox;
uniform float uPixelRatio;
uniform float uChars;
attribute float aSeed;
attribute float aGlyph;
attribute float aCharness;
varying float vAlpha;
varying float vChar;
varying float vGlyph;
void main() {
  vec3 drift = vec3(sin(uTime * 0.15 + aSeed * 30.0) * 0.6, -uTime * (0.25 + aSeed * 0.35), cos(uTime * 0.12 + aSeed * 17.0) * 0.6);
  // 以相機為中心環繞的盒子：粒子永遠包住相機，往下潛時看起來在往上飄
  vec3 local = mod(position + drift - cameraPosition + uBox * 0.5, uBox) - uBox * 0.5;
  vec3 world = cameraPosition + local;
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  // 200 m 以下逐顆變成字元：每顆在出生時就決定了門檻與字元，不會逐幀換字
  vChar = smoothstep(aCharness - 0.04, aCharness + 0.04, uChars);
  vGlyph = aGlyph;
  float size = (0.6 + aSeed * 1.6) * mix(1.0, 3.0, vChar) * uPixelRatio;
  gl_PointSize = size * 26.0 / max(-mv.z, 0.5);
  float edge = 1.0 - smoothstep(0.32, 0.5, max(abs(local.x) / uBox.x, max(abs(local.y) / uBox.y, abs(local.z) / uBox.z)));
  vAlpha = edge * smoothstep(0.0, -2.0, world.y) * smoothstep(42.0, 6.0, -mv.z);
}`;

const frag = /* glsl */ `
uniform float uBright;
uniform sampler2D uAtlas;
uniform float uGrid;
varying float vAlpha;
varying float vChar;
varying float vGlyph;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float disc = smoothstep(0.5, 0.1, length(c));
  vec2 cell = vec2(mod(vGlyph, uGrid), floor(vGlyph / uGrid));
  float glyph = texture2D(uAtlas, (cell + gl_PointCoord) / uGrid).a;
  float a = mix(disc, glyph, vChar) * vAlpha * uBright;
  if (a < 0.003) discard;
  vec3 col = mix(vec3(0.82, 0.93, 1.0), vec3(0.55, 0.98, 0.86), vChar * 0.6);
  gl_FragColor = vec4(col * a, 1.0);
}`;

/** 海雪：在相機周圍環繞的漂浮顆粒，提供下潛時的速度感；越深越多顆變成等寬字元，往下飄像 tail -f */
export default function MarineSnow({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const rng = createRng(SCENE_SEED + 11);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const glyphs = new Float32Array(count);
    const charness = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * BOX[0];
      positions[i * 3 + 1] = (rng() - 0.5) * BOX[1];
      positions[i * 3 + 2] = (rng() - 0.5) * BOX[2];
      seeds[i] = rng();
      // 1–15 號格子（0 是空白）
      glyphs[i] = 1 + Math.floor(rng() * SNOW_GLYPHS);
      charness[i] = 0.04 + rng() * 0.92;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    g.setAttribute('aGlyph', new BufferAttribute(glyphs, 1));
    g.setAttribute('aCharness', new BufferAttribute(charness, 1));
    const m = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uBox: { value: new Vector3(...BOX) },
        uPixelRatio: { value: 1 },
        uBright: { value: 1 },
        uChars: { value: 0 },
        uAtlas: { value: glyphAtlas() },
        uGrid: { value: GLYPH_GRID },
      },
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((state) => {
    const pos = useSiteStore.getState().pos;
    material.uniforms.uTime!.value = sceneTime(state);
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
    material.uniforms.uBright!.value = 0.35 + 0.65 * sunlight(pos);
    // 作品段（200 m）開始出現字元，經歷段（1000 m）以下全部是字
    material.uniforms.uChars!.value = smoothstep(2.6, 3.9, evenPos(pos));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
