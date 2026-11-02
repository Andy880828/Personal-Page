export type ProjectCategory = 'agent' | 'selfhost' | 'data' | 'web' | 'bio';

export interface Project {
  slug: string;
  name: string;
  nameZh?: string;
  /** 一句話說明（卡片主文） */
  summary: string;
  /** 補充亮點，最多三點 */
  highlights: string[];
  tags: string[];
  year: number;
  categories: ProjectCategory[];
  /** 公開 repo 才放；私有 repo 留空 */
  repo?: string;
  demo?: string;
  /** 有截圖的放 key（見 projectImages），沒有的用程式產生的封面 */
  image?: 'recipecube' | 'trim2sort' | 'fitness';
  /** 沒截圖時封面上顯示的「終端機」內容 */
  cover?: { prompt: string; lines: string[] };
  status: 'active' | 'stable' | 'archived';
  /** 補充說明，例如私有 repo、demo 暫停 */
  note?: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  nameEn: string;
  /** 3D 氣泡與 UI 的強調色 */
  color: string;
  summary: string;
  strengths: string[];
  tools: string[];
}

export interface ExperienceItem {
  start: string;
  end: string | null;
  title: string;
  org: string;
  kind: 'edu' | 'work' | 'abroad' | 'build';
  note?: string;
}
