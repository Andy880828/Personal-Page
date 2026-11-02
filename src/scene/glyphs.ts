import { CanvasTexture, LinearFilter, type Texture } from 'three';

/**
 * 等寬字元圖集（4×4 格），字元海雪與 ASCII 後製共用。
 * 字元依「墨量」由少到多排序：ASCII 後製用亮度直接選格子（亮度 0 → 空白、1 → 最濃的字）。
 */
export const GLYPHS = [' ', '.', '-', ':', '_', ';', '/', '\\', '|', '<', '>', '=', '+', '*', '{', '0'] as const;
export const GLYPH_GRID = 4;
/** 海雪用的字元（不含空白） */
export const SNOW_GLYPHS = GLYPHS.length - 1;

let atlas: Texture | null = null;

export function glyphAtlas(): Texture | null {
  if (atlas) return atlas;
  if (typeof document === 'undefined') return null;
  const cell = 32;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cell * GLYPH_GRID;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null; // 測試環境（jsdom）沒有 2D context
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${cell * 0.78}px "JetBrains Mono", ui-monospace, monospace`;
  GLYPHS.forEach((g, i) => {
    const x = (i % GLYPH_GRID) * cell + cell / 2;
    const y = Math.floor(i / GLYPH_GRID) * cell + cell / 2;
    ctx.fillText(g, x, y + cell * 0.04);
  });
  const tex = new CanvasTexture(canvas);
  // 不要 mipmap：字很小時 mipmap 會把相鄰格子混在一起
  tex.generateMipmaps = false;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.flipY = false;
  atlas = tex;
  return tex;
}
