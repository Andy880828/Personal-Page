import { describe, expect, it } from 'vitest';
import { COMMANDS, runCommand } from '@/lib/console';

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
    expect(runCommand('cat frontend', ctx).lines[0]).toContain('網頁前端');
    expect(runCommand('cat syssec', ctx).lines.join('\n')).toContain('github.com');
    expect(runCommand('cat scout', ctx).lines.join('\n')).toContain('私人');
    expect(runCommand('cat nope', ctx).lines[0]).toContain('找不到');
  });

  it('tier、motion、clear、exit、未知指令', () => {
    expect(runCommand('tier', ctx).lines[0]).toContain('tier 2');
    expect(runCommand('tier 0', ctx).action).toEqual({ type: 'tier', tier: 0 });
    expect(runCommand('tier 7', ctx).action).toBeUndefined();
    expect(runCommand('motion off', ctx).action).toEqual({ type: 'motion', reduce: true });
    expect(runCommand('clear', ctx).action).toEqual({ type: 'clear' });
    expect(runCommand('exit', ctx).action).toEqual({ type: 'close' });
    expect(runCommand('frobnicate', ctx).lines[0]).toContain('沒有這個指令');
    expect(runCommand('   ', ctx).lines).toEqual([]);
  });
});
