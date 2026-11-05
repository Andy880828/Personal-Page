import type { Material } from 'three';

/**
 * 淡入淡出用的有序抖動（screen-door）：不透明的模型不改成半透明（雙面網格半透明會看到內面、排序也會亂），
 * 而是依 4×4 Bayer 門檻丟掉一部分像素，uFade 0 → 1 由全透明漸變到完整。
 * 霧與暗色剪影會把抖動的點吃掉，看起來像平滑淡出。
 */
export const DITHER_GLSL = /* glsl */ `
float bayer4(vec2 p) {
  ivec2 q = ivec2(mod(p, 4.0));
  int i = q.x + q.y * 4;
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0;
}`;

export const DITHER_DISCARD = /* glsl */ `if (uFade < 0.999 && bayer4(gl_FragCoord.xy) >= uFade) discard;`;

/**
 * 給 three 內建材質（MeshStandardMaterial 等）加上抖動淡出；
 * 已經有 onBeforeCompile 的材質要在自己的 onBeforeCompile 裡呼叫 injectDither。
 */
export function injectDither(
  shader: { fragmentShader: string; uniforms: Record<string, { value: unknown }> },
  uFade: { value: number },
) {
  shader.uniforms.uFade = uFade;
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\nuniform float uFade;\n${DITHER_GLSL}`)
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${DITHER_DISCARD}`);
}

export function addDitherFade(material: Material, uFade: { value: number }) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    prev.call(material, shader, renderer);
    injectDither(shader, uFade);
  };
  const key = material.customProgramCacheKey();
  material.customProgramCacheKey = () => `${key}|dither`;
}
