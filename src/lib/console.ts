import { SECTIONS, type SectionId } from './sections';
import { formatDepth } from './scroll';
import { projects, categoryLabels } from '@/content/projects';
import { skills } from '@/content/skills';
import { profile } from '@/content/profile';
import { formatLight, lightFraction, pressureAtm, temperatureC, zoneAt } from '@/content/science';

/**
 * 站內指令列的純邏輯：輸入一行字，回傳要印的行與要做的動作。
 * 不碰 DOM，方便單元測試；副作用由 Console 元件執行。
 */
export type ConsoleAction =
  | { type: 'goto'; section: SectionId }
  | { type: 'dive'; depth: number }
  | { type: 'tier'; tier: number }
  | { type: 'motion'; reduce: boolean }
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
}

export const COMMANDS: { name: string; usage: string; help: string }[] = [
  { name: 'help', usage: 'help', help: '列出所有指令' },
  { name: 'ls', usage: 'ls [sections|projects|skills]', help: '列出段落、作品或技能' },
  { name: 'goto', usage: 'goto <section>', help: '捲到某段：about、skills、projects、experience、contact、hero' },
  { name: 'dive', usage: 'dive <公尺>', help: '潛到指定深度（0–4000）' },
  { name: 'ctd', usage: 'ctd', help: '目前深度的壓力、水溫、光量與分層' },
  { name: 'cat', usage: 'cat <skill|project>', help: '顯示一組技能或一個作品的細節' },
  { name: 'whoami', usage: 'whoami', help: '這個網站的主人' },
  { name: 'tier', usage: 'tier [0-3]', help: '查看或切換 3D 等級（切換會重新載入）' },
  { name: 'motion', usage: 'motion on|off', help: '開關動態效果' },
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

export function ctdReport(depth: number): string[] {
  const d = Math.max(0, Math.round(depth));
  const z = zoneAt(d);
  return [
    `depth     ${formatDepth(d)} m`,
    `zone      ${z.zh}（${z.en}, ${z.from}–${z.to} m）`,
    `pressure  ${pressureAtm(d).toFixed(1)} atm`,
    `temp      ${temperatureC(d).toFixed(1)} °C（典型亞熱帶西北太平洋剖面，概略）`,
    `light     ${formatLight(lightFraction(d))} of surface light`,
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
      if (!arg || arg === 'sections')
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
      if (!target) return { lines: [`goto: 沒有 ${arg || '這一段'}；可用 ${Object.keys(SECTION_ALIASES).join('、')}`] };
      return { lines: [`→ ${target}`], action: { type: 'goto', section: target } };
    }
    case 'dive': {
      const m = Number(arg.replace(/m$/, ''));
      if (!Number.isFinite(m)) return { lines: ['dive: 要給一個公尺數，例如 dive 1200'] };
      const depth = Math.min(4000, Math.max(0, m));
      return { lines: [`↓ ${formatDepth(depth)} m`, ...ctdReport(depth)], action: { type: 'dive', depth } };
    }
    case 'ctd':
      return { lines: ctdReport(ctx.depth) };
    case 'cat': {
      const sk = skills.find((s) => s.id === arg || s.name === args.join(' '));
      if (sk)
        return {
          lines: [
            `# ${sk.name} (${sk.nameEn})`,
            sk.summary,
            ...sk.strengths.map((t) => `- ${t}`),
            `tools: ${sk.tools.join(', ')}`,
          ],
        };
      const pj = projects.find((p) => p.slug === arg || p.name.toLowerCase() === arg);
      if (pj)
        return {
          lines: [
            `# ${pj.name}${pj.nameZh ? `  ${pj.nameZh}` : ''}`,
            pj.summary,
            ...pj.highlights.map((h) => `- ${h}`),
            `tags: ${pj.tags.join(', ')}`,
            pj.repo ? `repo: ${pj.repo}` : `repo: （私人）${pj.note ?? ''}`,
          ],
        };
      return { lines: [`cat: 找不到 ${arg}（試試 ls skills 或 ls projects）`] };
    }
    case 'whoami':
      return {
        lines: [`${profile.name} / ${profile.nameEn}`, `${profile.role} · ${profile.roleSecond}`, profile.links.github],
      };
    case 'tier': {
      if (!arg) return { lines: [`tier ${ctx.tier ?? '（偵測中）'}：0 純 DOM、1 省電、2 完整、3 高階`] };
      const t = Number(arg);
      if (![0, 1, 2, 3].includes(t)) return { lines: ['tier: 只能是 0–3'] };
      return { lines: [`切換到 tier ${t}，重新載入…`], action: { type: 'tier', tier: t } };
    }
    case 'motion': {
      if (arg !== 'on' && arg !== 'off')
        return { lines: [`motion: 目前${ctx.reduced ? 'off' : 'on'}；用 motion on 或 motion off`] };
      return { lines: [`motion ${arg}`], action: { type: 'motion', reduce: arg === 'off' } };
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
