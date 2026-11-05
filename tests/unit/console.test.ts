import { describe, expect, it } from 'vitest';
import { COMMANDS, promptFor, runCommand } from '@/lib/console';

const ctx = { depth: 1200, tier: 2, reduced: false };

describe('指令列', () => {
  it('help 列出每個指令', () => {
    const r = runCommand('help', ctx);
    expect(r.lines).toHaveLength(COMMANDS.length);
    expect(r.lines.join('\n')).toContain('dive');
    for (const l of r.lines) expect(l.split('\t')).toHaveLength(2);
  });

  it('goto 與別名、未知段落', () => {
    expect(runCommand('goto projects', ctx).action).toEqual({ type: 'goto', section: 'projects' });
    expect(runCommand('cd seafloor', ctx).action).toEqual({ type: 'goto', section: 'contact' });
    expect(runCommand('goto nowhere', ctx).action).toBeUndefined();
  });

  it('dive 會夾在 0–4000 並回報 CTD', () => {
    const r = runCommand('dive 9999', ctx);
    expect(r.action).toEqual({ type: 'dive', depth: 4000 });
    expect(r.lines.join('\n')).toContain('401.0 atm');
    expect(runCommand('dive abc', ctx).action).toBeUndefined();
  });

  it('ctd 用目前深度', () => {
    const r = runCommand('ctd', ctx);
    expect(r.lines[0]).toContain('1,200 m');
    expect(r.lines.join('\n')).toContain('深層帶');
  });

  it('ls / cat 讀內容層', () => {
    expect(runCommand('ls projects', ctx).lines.length).toBeGreaterThanOrEqual(10);
    expect(runCommand('ls skills', ctx).lines).toHaveLength(5);
    expect(runCommand('cat mining', ctx).lines[0]).toContain('資料探勘');
    expect(runCommand('cat syssec', ctx).lines.join('\n')).toContain('github.com');
    expect(runCommand('cat scout', ctx).lines.join('\n')).toContain('未公開');
    expect(runCommand('cat nope', ctx).lines[0]).toContain('找不到');
  });

  it('提示字元是目前段落；ls 無參數列出這段可以 cat 的東西；cat zone 顯示說明與來源', () => {
    expect(promptFor(0)).toBe('~/ocean/hero $');
    expect(promptFor(1200)).toBe('~/ocean/experience $');
    expect(promptFor(4000)).toBe('~/ocean/contact $');
    expect(runCommand('ls', { ...ctx, depth: 150 }).lines[0]).toContain('mining');
    expect(runCommand('ls', { ...ctx, depth: 300 }).lines[0]).toContain('syssec');
    const zone = runCommand('cat zone', ctx).lines.join('\n');
    expect(zone).toContain('深層帶');
    expect(zone).toMatch(/https:\/\//);
  });

  it('contact、resume、whoami 帶 Email；here 是目前深度（ctd 仍可用）', () => {
    expect(runCommand('contact', ctx).lines.join('\n')).toContain('@');
    expect(runCommand('whoami', ctx).lines.join('\n')).toContain('@');
    expect(runCommand('resume', ctx).action).toMatchObject({ type: 'open' });
    expect(runCommand('here', ctx).lines.join('\n')).toContain('深層帶');
    expect(runCommand('ctd', ctx).lines).toEqual(runCommand('here', ctx).lines);
  });

  it('ascii on|off', () => {
    expect(runCommand('ascii on', ctx).action).toEqual({ type: 'ascii', on: true });
    expect(runCommand('ascii off', ctx).action).toEqual({ type: 'ascii', on: false });
    expect(runCommand('ascii', ctx).action).toBeUndefined();
    expect(runCommand('ascii on', { ...ctx, tier: 1 }).lines[0]).toContain('不支援');
  });

  it('tier、motion、clear、exit、未知指令', () => {
    expect(runCommand('tier', ctx).lines[0]).toContain('3D 等級 2');
    expect(runCommand('tier 0', ctx).action).toEqual({ type: 'tier', tier: 0 });
    expect(runCommand('tier 7', ctx).action).toBeUndefined();
    expect(runCommand('motion off', ctx).action).toEqual({ type: 'motion', reduce: true });
    expect(runCommand('clear', ctx).action).toEqual({ type: 'clear' });
    expect(runCommand('exit', ctx).action).toEqual({ type: 'close' });
    expect(runCommand('frobnicate', ctx).lines[0]).toContain('沒有這個指令');
    expect(runCommand('   ', ctx).lines).toEqual([]);
  });
});
