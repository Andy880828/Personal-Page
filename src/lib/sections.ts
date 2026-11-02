export type SectionId = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'contact';

export interface SectionDef {
  id: SectionId;
  label: string;
  labelEn: string;
  /** 有對應路由的段落：直接開這個網址會捲到這裡 */
  route?: string;
  /** 這一段代表的海洋深度（公尺） */
  depthStart: number;
  depthEnd: number;
  zone: string;
}

export const SECTIONS: readonly SectionDef[] = [
  { id: 'hero', label: '海面', labelEn: 'Surface', route: '/', depthStart: 0, depthEnd: 10, zone: '海面' },
  { id: 'about', label: '關於', labelEn: 'About', route: '/about', depthStart: 10, depthEnd: 100, zone: '透光帶' },
  { id: 'skills', label: '技能', labelEn: 'Skills', depthStart: 100, depthEnd: 200, zone: '透光帶' },
  {
    id: 'projects',
    label: '作品',
    labelEn: 'Projects',
    route: '/project',
    depthStart: 200,
    depthEnd: 1000,
    zone: '中層帶',
  },
  { id: 'experience', label: '經歷', labelEn: 'Experience', depthStart: 1000, depthEnd: 3800, zone: '深層帶' },
  { id: 'contact', label: '聯絡', labelEn: 'Contact', depthStart: 3800, depthEnd: 4000, zone: '海床' },
] as const;

export const SECTION_COUNT = SECTIONS.length;

export function sectionIndex(id: SectionId): number {
  return SECTIONS.findIndex((s) => s.id === id);
}

export function sectionForRoute(pathname: string): SectionId | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return SECTIONS.find((s) => s.route === clean)?.id ?? null;
}
