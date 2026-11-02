// 字體子集化：只保留網站實際用到的字，產出兩個 woff2（繁中 Noto Sans TC、等寬 JetBrains Mono）。
// 來源字體（Google Fonts，OFL）會下載到 node_modules/.cache/fonts；需要 python3 + fonttools + brotli。
// 內容改字後請重跑 `npm run fonts`；tests/unit/fonts.test.ts 會檢查有沒有漏字。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { collectSiteChars, BASE_CHARS } from './charset.mjs';

const CACHE = 'node_modules/.cache/fonts';
const OUT = 'public/fonts';
const SOURCES = {
  noto: {
    file: 'NotoSansTC[wght].ttf',
    url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf',
  },
  mono: {
    file: 'JetBrainsMono[wght].ttf',
    url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf',
  },
};

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

async function ensure(src) {
  const dest = path.join(CACHE, src.file);
  if (existsSync(dest)) return dest;
  const local = process.env.FONT_SRC_DIR && path.join(process.env.FONT_SRC_DIR, src.file);
  if (local && existsSync(local)) return local;
  console.log(`download ${src.url}`);
  const res = await fetch(src.url);
  if (!res.ok) throw new Error(`${res.status} ${src.url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

function subset(input, output, text, axes) {
  const textFile = path.join(CACHE, path.basename(output) + '.txt');
  writeFileSync(textFile, text);
  let src = input;
  if (axes) {
    const limited = path.join(CACHE, path.basename(output) + '.limited.ttf');
    execFileSync('python3', ['-m', 'fontTools.varLib.instancer', input, ...axes, '-o', limited, '-q']);
    src = limited;
  }
  execFileSync('python3', [
    '-m',
    'fontTools.subset',
    src,
    `--text-file=${textFile}`,
    '--flavor=woff2',
    '--layout-features=kern,liga,calt,locl,palt,vpal,halt,tnum',
    '--no-hinting',
    '--desubroutinize',
    `--output-file=${output}`,
  ]);
  console.log(`${output} ${(statSync(output).size / 1024).toFixed(1)} KB, ${[...new Set(text)].length} chars`);
}

const siteChars = collectSiteChars();
const notoText = [...new Set(BASE_CHARS + siteChars)].sort().join('');
const monoText = [...new Set(BASE_CHARS + '→←↑↓✓✗●○·…—–│├└─▸▾°±×')].sort().join('');

subset(await ensure(SOURCES.noto), path.join(OUT, 'noto-sans-tc.woff2'), notoText, ['wght=300:900']);
subset(await ensure(SOURCES.mono), path.join(OUT, 'jetbrains-mono.woff2'), monoText, ['wght=400:700']);
writeFileSync(path.join(OUT, 'noto-sans-tc.chars.txt'), notoText);
console.log('license: OFL-1.1, see public/fonts/OFL.txt');
