import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const BASE_CHARS =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
  '　、。，．：；？！「」『』（）《》〈〉…—–‧・～％＋－＝／';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|html)$/.test(name)) out.push(p);
  }
  return out;
}

/** 去掉註解：註解不會出現在畫面上，不該讓字體變大 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}(),])\/\/.*$/gm, '$1');
}

/** 收集網站原始碼裡出現的所有非 ASCII 字元（含中文），不含註解 */
export function collectSiteChars(root = process.cwd()) {
  const files = [...walk(path.join(root, 'src')), path.join(root, 'index.html')];
  const set = new Set();
  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const text = /\.(tsx?)$/.test(f) ? stripComments(raw) : raw;
    for (const ch of text) {
      if (ch.charCodeAt(0) > 0x7e) set.add(ch);
    }
  }
  return [...set].sort().join('');
}
