export type ProjectCategory = 'mining' | 'viz' | 'workflow' | 'agent' | 'web';

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
  /** 補充說明，例如原始碼未公開、線上展示已下架 */
  note?: string;
  /** 精選排序：有值的才在「全部」狀態用卡片呈現，數字小的在前 */
  featured?: number;
  /** 一行成果（有數字）。只放站主提供的事實；沒有就不顯示 */
  outcome?: string;
  /** 個人或團隊、負責哪部分。只放站主提供的事實；沒有就不顯示 */
  role?: string;
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
  /** 工作成果（2–3 條）；只放站主提供的事實 */
  highlights?: string[];
  /** 次要經歷：在時間軸上用精簡列呈現 */
  minor?: boolean;
}
