import { SECTIONS, type SectionId } from './sections';
import { formatDepth } from './scroll';
import { projects, categoryLabels } from '@/content/projects';
import { skills } from '@/content/skills';
import { profile } from '@/content/profile';
import { formatLight, lightFraction, NOTES, pressureAtm, SOURCES, temperatureC, zoneAt } from '@/content/science';

/**
 * 站內指令列的純邏輯：輸入一行字，回傳要印的行與要做的動作。
 * 不碰 DOM，方便單元測試；副作用由 Console 元件執行。
 */
export type ConsoleAction =
  | { type: 'goto'; section: SectionId }
  | { type: 'dive'; depth: number }
  | { type: 'tier'; tier: number }
  | { type: 'motion'; reduce: boolean }
  | { type: 'ascii'; on: boolean }
  | { type: 'open'; url: string }
  | { type: 'clear' }
  | { type: 'close' };

export interface ConsoleResult {
  lines: string[];
  action?: ConsoleAction;
}

export interface ConsoleContext {
  depth: number;
  tier: number | null;
  reduced: boolean;
  ascii?: boolean;
}

/** 深度 → 所在段落（指令列的「目前目錄」） */
export function sectionAtDepth(depth: number): SectionId {
  const d = Math.max(0, depth);
  return (SECTIONS.find((s) => d < s.depthEnd) ?? SECTIONS[SECTIONS.length - 1]!).id;
}

/** 提示字元：深度就是目前目錄 */
export function promptFor(depth: number): string {
  return `~/ocean/${sectionAtDepth(depth)} $`;
}

/** 每一段 `ls` 列得出來、可以 `cat` 的東西 */
function listing(section: SectionId): string[] {
  if (section === 'skills') return [...skills.map((s) => s.id), 'zone'];
  if (section === 'projects') return [...projects.map((p) => p.slug), 'zone'];
  return ['zone'];
}

/** 這一段深度帶的說明與來源（網站畫面上不寫，想看的人用 cat zone） */
function zoneReport(section: SectionId): string[] {
  const n = NOTES.find((x) => x.section === section);
  if (!n) return ['cat: 這裡沒有 zone'];
  return [
    `# ${n.title}`,
    n.body,
    `畫面：${n.seen}`,
    ...n.sources.map((id) => {
      const src = SOURCES.find((x) => x.id === id)!;
      return `[${id}] ${src.title}  ${src.url}`;
    }),
  ];
}

export const COMMANDS: { name: string; usage: string; help: string }[] = [
  { name: 'help', usage: 'help', help: '列出所有指令' },
  {
    name: 'ls',
    usage: 'ls [sections|projects|skills]',
    help: '不加參數列出這一段能 cat 的項目；加參數列出全部段落、作品或技能',
  },
  { name: 'goto', usage: 'goto <section>', help: '捲到某段：hero、about、skills、projects、experience、contact' },
  { name: 'dive', usage: 'dive <公尺>', help: '潛到指定深度（0–4,000 m）' },
  { name: 'here', usage: 'here', help: '目前深度的壓力、水溫、光量與分層（右側儀表的數值）' },
  { name: 'cat', usage: 'cat <skill|project|zone>', help: '顯示技能、作品，或這段深度帶的說明與來源' },
  { name: 'whoami', usage: 'whoami', help: '這個網站的主人' },
  { name: 'contact', usage: 'contact', help: 'Email、履歷與其他聯絡方式' },
  { name: 'resume', usage: 'resume', help: '開啟履歷（新分頁）' },
  { name: 'tier', usage: 'tier [0-3]', help: '查看或切換 3D 等級（切換會重新載入）' },
  { name: 'motion', usage: 'motion on|off', help: '開關動態效果' },
  { name: 'ascii', usage: 'ascii on|off', help: '整個畫面改成字元畫（需要 3D 等級 2 以上）' },
  { name: 'clear', usage: 'clear', help: '清空畫面' },
  { name: 'exit', usage: 'exit', help: '關閉指令列（或按 Esc）' },
];

const SECTION_ALIASES: Record<string, SectionId> = {
  hero: 'hero',
  surface: 'hero',
  top: 'hero',
  about: 'about',
  skills: 'skills',
  skill: 'skills',
  projects: 'projects',
  project: 'projects',
  work: 'projects',
  experience: 'experience',
  exp: 'experience',
  contact: 'contact',
  seafloor: 'contact',
  bottom: 'contact',
};

const SECTION_NAMES = 'hero、about、skills、projects、experience、contact';

/** 海床段（3,800 m 以下）統一叫「海床」，分層寫深層帶底部；深淵帶只出現在 4,000 m 以下的分層資料裡 */
function zoneLine(d: number): string {
  const z = d >= 4000 ? zoneAt(3999) : zoneAt(d);
  const range = `${formatDepth(z.from)}–${formatDepth(z.to)} m`;
  if (d >= 3800) return `分層  海床（${z.zh}底部，${z.en} ${range}）`;
  return `分層  ${z.zh}（${z.en}，${range}）`;
}

export function ctdReport(depth: number, withDepth = true): string[] {
  const d = Math.max(0, Math.round(depth));
  return [
    ...(withDepth ? [`深度  ${formatDepth(d)} m`] : []),
    zoneLine(d),
    `壓力  ${pressureAtm(d).toFixed(1)} atm`,
    `水溫  ${temperatureC(d).toFixed(1)} °C（西北太平洋典型剖面，概略值）`,
    `光量  海面的 ${formatLight(lightFraction(d))}`,
  ];
}

export function runCommand(input: string, ctx: ConsoleContext): ConsoleResult {
  const [cmd = '', ...args] = input.trim().split(/\s+/);
  const arg = args.join(' ').toLowerCase();
  switch (cmd.toLowerCase()) {
    case '':
      return { lines: [] };
    case 'help':
    case '?':
      // 用 tab 分隔用法與說明，由畫面排成兩欄（padEnd 在中文寬度下對不齊）
      return { lines: COMMANDS.map((c) => `${c.usage}\t${c.help}`) };
    case 'ls': {
      if (!arg) return { lines: [listing(sectionAtDepth(ctx.depth)).join('  ')] };
      if (arg === 'sections')
        return {
          lines: SECTIONS.map((s) => `${s.id.padEnd(12)} ${formatDepth(s.depthStart).padStart(6)} m  ${s.label}`),
        };
      if (arg === 'projects')
        return {
          lines: projects.map(
            (p) => `${p.slug.padEnd(26)} ${String(p.year)}  ${p.categories.map((c) => categoryLabels[c]).join('/')}`,
          ),
        };
      if (arg === 'skills') return { lines: skills.map((s) => `${s.id.padEnd(12)} ${s.name}`) };
      return { lines: [`ls: 不認識 ${arg}（可用 sections、projects、skills）`] };
    }
    case 'goto':
    case 'cd': {
      const target = SECTION_ALIASES[arg];
      if (!arg) return { lines: [`goto: 要去哪一段？可用 ${SECTION_NAMES}`] };
      if (!target) return { lines: [`goto: 沒有「${arg}」這一段；可用 ${SECTION_NAMES}`] };
      return { lines: [`→ ${target}`], action: { type: 'goto', section: target } };
    }
    case 'dive': {
      const m = Number(arg.replace(/m$/, ''));
      if (!Number.isFinite(m)) return { lines: ['dive: 請輸入公尺數，例如 dive 1200'] };
      const depth = Math.min(4000, Math.max(0, m));
      return { lines: [`↓ ${formatDepth(depth)} m`, ...ctdReport(depth, false)], action: { type: 'dive', depth } };
    }
    case 'here':
    case 'ctd':
      return { lines: ctdReport(ctx.depth) };
    case 'cat': {
      if (arg === 'zone') return { lines: zoneReport(sectionAtDepth(ctx.depth)) };
      const sk = skills.find((s) => s.id === arg || s.name === args.join(' '));
      if (sk)
        return {
          lines: [
            `# ${sk.name}（${sk.nameEn}）`,
            sk.summary,
            ...sk.strengths.map((t) => `- ${t}`),
            `工具：${sk.tools.join('、')}`,
          ],
        };
      const pj = projects.find((p) => p.slug === arg || p.name.toLowerCase() === arg);
      if (pj)
        return {
          lines: [
            `# ${pj.name}${pj.nameZh ? `  ${pj.nameZh}` : ''}`,
            pj.summary,
            ...pj.highlights.map((h) => `- ${h}`),
            `技術：${pj.tags.join('、')}`,
            ...(pj.demo ? [`線上展示：${pj.demo}`] : []),
            pj.repo ? `原始碼：${pj.repo}` : '原始碼：未公開',
          ],
        };
      return { lines: [`cat: 找不到 ${arg}（試試 ls skills 或 ls projects）`] };
    }
    case 'whoami':
      return {
        lines: [
          `${profile.name} / ${profile.nameEn}`,
          profile.roleZh,
          `${profile.role} · ${profile.roleSecond}`,
          profile.email,
        ],
      };
    case 'contact':
      return {
        lines: [
          `Email   ${profile.email}`,
          `履歷    ${profile.links.resume}`,
          `GitHub  ${profile.links.github}`,
          // 完整網址很長（pfbid…），只印可讀的名稱；要點開請用聯絡段的連結
          `Facebook  facebook.com/${profile.name}`,
        ],
      };
    case 'resume':
      return { lines: [`↗ ${profile.links.resume}`], action: { type: 'open', url: profile.links.resume } };
    case 'tier': {
      if (!arg) return { lines: [`目前 3D 等級 ${ctx.tier ?? '（偵測中）'}：0 不用 3D、1 省電、2 標準、3 全效果`] };
      const t = Number(arg);
      if (![0, 1, 2, 3].includes(t)) return { lines: ['tier: 只能是 0–3'] };
      return { lines: [`切換到 3D 等級 ${t}，重新載入…`], action: { type: 'tier', tier: t } };
    }
    case 'motion': {
      if (arg !== 'on' && arg !== 'off')
        return { lines: [`motion: 目前 ${ctx.reduced ? 'off' : 'on'}，用 motion on 或 motion off 切換`] };
      return { lines: [`motion ${arg}`], action: { type: 'motion', reduce: arg === 'off' } };
    }
    case 'ascii': {
      if (arg !== 'on' && arg !== 'off')
        return { lines: [`ascii: 目前 ${ctx.ascii ? 'on' : 'off'}，用 ascii on 或 ascii off 切換`] };
      // 不支援的等級不要先說 on
      if (arg === 'on' && ctx.tier !== null && ctx.tier < 2)
        return { lines: [`ascii: 目前 3D 等級 ${ctx.tier}，字元畫需要 2 以上（輸入 tier 2）`] };
      return { lines: [`ascii ${arg}`], action: { type: 'ascii', on: arg === 'on' } };
    }
    case 'clear':
      return { lines: [], action: { type: 'clear' } };
    case 'exit':
    case 'quit':
    case 'q':
      return { lines: [], action: { type: 'close' } };
    default:
      return { lines: [`${cmd}: 沒有這個指令，輸入 help 看看`] };
  }
}
