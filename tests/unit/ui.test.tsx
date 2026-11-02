import { describe, expect, it, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, renderHook } from '@testing-library/react';
import Skills from '@/sections/Skills';
import Projects from '@/sections/Projects';
import { useSiteStore } from '@/store/useSiteStore';
import { navigate, usePathname } from '@/lib/router';
import { projects } from '@/content/projects';

beforeEach(() => {
  useSiteStore.setState({ activeSkill: 'frontend', projectFilter: 'all', motionPref: 'reduce' });
});

describe('技能分頁', () => {
  it('點分頁會切換內容並同步到 store（3D 氣泡讀同一個值）', () => {
    render(<Skills />);
    fireEvent.click(screen.getByRole('tab', { name: /資料庫/ }));
    expect(useSiteStore.getState().activeSkill).toBe('database');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('PostgreSQL');
  });

  it('方向鍵在分頁間移動（WAI-ARIA tabs）', () => {
    render(<Skills />);
    const first = screen.getByRole('tab', { name: /網頁前端/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(useSiteStore.getState().activeSkill).toBe('backend');
    fireEvent.keyDown(screen.getByRole('tab', { name: /網頁後端/ }), { key: 'End' });
    expect(useSiteStore.getState().activeSkill).toBe('bio');
  });
});

describe('作品篩選', () => {
  it('選「自架」只剩自架類作品', () => {
    render(<Projects />);
    expect(screen.getAllByRole('article')).toHaveLength(projects.length);
    fireEvent.click(screen.getByRole('button', { name: /自架/ }));
    const titles = screen.getAllByRole('article').map((a) => a.getAttribute('aria-labelledby'));
    expect(titles).toEqual(projects.filter((p) => p.categories.includes('selfhost')).map((p) => `p-${p.slug}`));
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
