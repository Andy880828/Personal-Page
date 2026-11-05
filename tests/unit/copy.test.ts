import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 文案 lint：可驗證的「去 AI 味」。
 * 掃內容檔、段落元件、index.html、README 的文字（程式註解不算），禁止空泛的形容與行銷字。
 * 寫法原則：動詞具體（抓、去重、比對、輸出）、說給誰用、說怎麼驗證；不形容感受。
 */
const BANNED: [string, RegExp][] = [
  ['AI', /(?<![A-Za-z])AI(?![A-Za-z])/],
  ['LLM', /(?<![A-Za-z])LLM(?![A-Za-z])/],
  ...['大語言模型', '智慧', '賦能', '打造', '探索', '解鎖', '無縫', '強大', '革命', '旅程', '沉浸'].map(
    (w): [string, RegExp] => [w, new RegExp(w)],
  ),
  ['field note', /field note/i],
  ['CTD', /(?<![A-Za-z])CTD(?![A-Za-z])/],
  // 台灣用語：視覺化、資料（不用「可視化」）
  ['可視化', /可視化/],
  // 一律寫「資料」；台郡的正式職稱「數據分析工程師」例外
  ['數據', /數據(?!分析工程師)/],
  ['emoji', /\p{Emoji_Presentation}/u],
];

const root = path.resolve(__dirname, '../..');
const files = [
  ...readdirSync(path.join(root, 'src/content'))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => `src/content/${f}`),
  ...readdirSync(path.join(root, 'src/sections'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => `src/sections/${f}`),
  // 元件與指令列的文字也是網站文案（以前沒掃，「ctd」「純 DOM」「後製」因此漏掉）
  ...readdirSync(path.join(root, 'src/components'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => `src/components/${f}`),
  'src/lib/console.ts',
  'index.html',
  'README.md',
];

/** 把註解換成同樣行數的空白，行號才對得上 */
function stripComments(file: string, text: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  let out = text;
  if (/\.(ts|tsx)$/.test(file)) {
    out = out
      .replace(/\/\*[\s\S]*?\*\//g, blank)
      .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank)
      .replace(/(^|[^:])\/\/.*$/gm, (m, p: string) => p + blank(m.slice(p.length)));
  }
  if (file.endsWith('.html')) out = out.replace(/<!--[\s\S]*?-->/g, blank);
  // 科學來源的論文標題照原文，不算網站文案
  if (file.endsWith('science.ts')) out = out.replace(/export const SOURCES[\s\S]*?\n\];/, blank);
  // README 的科學資料來源段同上
  if (file === 'README.md') out = out.replace(/## 科學資料來源[\s\S]*?(?=\n## |$)/, blank);
  return out;
}

describe('文案 lint', () => {
  for (const file of files) {
    it(file, () => {
      const lines = stripComments(file, readFileSync(path.join(root, file), 'utf8')).split('\n');
      const hits: string[] = [];
      lines.forEach((line, i) => {
        for (const [word, re] of BANNED) if (re.test(line)) hits.push(`${file}:${i + 1}「${word}」 ${line.trim()}`);
      });
      expect(hits, hits.join('\n')).toEqual([]);
    });
  }
});
