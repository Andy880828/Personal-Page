import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Effect } from 'postprocessing';
import { Uniform, Vector2, type Texture } from 'three';
import { useSiteStore } from '@/store/useSiteStore';
import { GLYPH_GRID, glyphAtlas } from './glyphs';
import { isFrozen } from './time';
import { crossedThreshold } from './thresholds';

const frag = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uBand;
uniform float uAll;
uniform vec2 uRes;
uniform float uCell;
uniform float uGrid;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // 掃描帶：高 18% 的水平帶，uBand 是帶的下緣（由上往下 0 → 1.18）；ascii on 時整個畫面
  float y = 1.0 - uv.y;
  float inBand = max(uAll, step(uBand - 0.18, y) * step(y, uBand));
  if (inBand < 0.5) {
    outputColor = inputColor;
    return;
  }
  // 每個字元格只取格子中心一次，亮度量化成 8 階再選字：同一格的字不會因雜訊逐幀跳動
  vec2 px = uv * uRes;
  vec2 cell = floor(px / uCell);
  vec3 c = texture2D(inputBuffer, (cell + 0.5) * uCell / uRes).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float level = floor(clamp(lum * 1.8, 0.0, 0.999) * 8.0);
  float glyph = floor(level / 7.0 * (uGrid * uGrid - 1.0) + 0.5);
  vec2 f = fract(px / uCell);
  vec2 auv = (vec2(mod(glyph, uGrid), floor(glyph / uGrid)) + vec2(f.x, 1.0 - f.y)) / uGrid;
  float a = texture2D(uAtlas, auv).a;
  vec3 ink = mix(vec3(0.31, 0.94, 0.82), c * 1.8 + 0.1, 0.45);
  outputColor = vec4(mix(c * 0.12, ink, a), inputColor.a);
}`;

class AsciiBandEffect extends Effect {
  constructor(atlas: Texture | null) {
    super('AsciiBand', frag, {
      uniforms: new Map<string, Uniform>([
        ['uAtlas', new Uniform(atlas)],
        ['uBand', new Uniform(-1)],
        ['uAll', new Uniform(0)],
        ['uRes', new Uniform(new Vector2(1, 1))],
        ['uCell', new Uniform(8)],
        ['uGrid', new Uniform(GLYPH_GRID)],
      ]),
    });
  }
}

const SWEEP_MS = 600;

/**
 * 聲納回波：捲過 200 m 與 1000 m 時，一條水平帶由上往下掃過，帶內的畫面讀成字元再還原。
 * 指令 ascii on 讓整個畫面維持字元渲染。只在 tier ≥ 2（有後製）時存在；減少動態時不掃。
 */
export default function AsciiBand() {
  const effect = useMemo(() => new AsciiBandEffect(glyphAtlas()), []);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => () => effect.dispose(), [effect]);

  useEffect(() => {
    let start = -1;
    let raf = 0;
    const tick = () => {
      const k = (performance.now() - start) / SWEEP_MS;
      effect.uniforms.get('uBand')!.value = k * 1.18;
      invalidate();
      if (k < 1) raf = requestAnimationFrame(tick);
      else effect.uniforms.get('uBand')!.value = -1;
    };
    return useSiteStore.subscribe((s, prev) => {
      if (s.ascii !== prev.ascii) {
        effect.uniforms.get('uAll')!.value = s.ascii ? 1 : 0;
        invalidate();
      }
      if (isFrozen() || !crossedThreshold(prev.depth, s.depth)) return;
      start = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    });
  }, [effect, invalidate]);

  useFrame(() => {
    const res = effect.uniforms.get('uRes')!.value as Vector2;
    res.set(size.width * dpr, size.height * dpr);
    effect.uniforms.get('uCell')!.value = 8 * dpr;
  });

  return <primitive object={effect} dispose={null} />;
}
