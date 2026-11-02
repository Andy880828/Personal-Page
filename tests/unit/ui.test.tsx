import { describe, expect, it, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, renderHook } from '@testing-library/react';
import Skills from '@/sections/Skills';
import Projects from '@/sections/Projects';
import { useSiteStore } from '@/store/useSiteStore';
import { navigate, usePathname } from '@/lib/router';
import { projects } from '@/content/projects';

beforeEach(() => {
  useSiteStore.setState({ activeSkill: 'mining', projectFilter: 'all', motionPref: 'reduce' });
});

describe('技能分頁', () => {
  it('點分頁會切換內容並同步到 store（3D 氣泡讀同一個值）', () => {
    render(<Skills />);
    fireEvent.click(screen.getByRole('tab', { name: /工作流程數位化/ }));
    expect(useSiteStore.getState().activeSkill).toBe('workflow');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('PostgreSQL');
  });

  it('方向鍵在分頁間移動（WAI-ARIA tabs）', () => {
    render(<Skills />);
    const first = screen.getByRole('tab', { name: /資料探勘/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(useSiteStore.getState().activeSkill).toBe('viz');
    fireEvent.keyDown(screen.getByRole('tab', { name: /數據可視化/ }), { key: 'End' });
    expect(useSiteStore.getState().activeSkill).toBe('web');
  });
});

describe('作品篩選', () => {
  it('選「流程數位化」只剩這一類作品', () => {
    render(<Projects />);
    expect(screen.getAllByRole('article')).toHaveLength(projects.length);
    fireEvent.click(screen.getByRole('button', { name: /流程數位化/ }));
    const titles = screen.getAllByRole('article').map((a) => a.getAttribute('aria-labelledby'));
    expect(titles).toEqual(projects.filter((p) => p.categories.includes('workflow')).map((p) => `p-${p.slug}`));
  });
});

describe('路由', () => {
  it('navigate 會更新 usePathname', () => {
    const { result } = renderHook(() => usePathname());
    act(() => navigate('/project'));
    expect(result.current).toBe('/project');
    act(() => navigate('/', { replace: true }));
    expect(result.current).toBe('/');
  });
});
