import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  {
    id: 'frontend',
    name: '網頁前端',
    nameEn: 'Frontend',
    color: '#4ff0d2',
    summary: '從切版到互動，做出好讀、好用、在手機上也站得住的介面。',
    strengths: ['響應式設計（RWD）', '元件化與狀態管理', '互動動畫與 3D 視覺', '前端測試（Vitest、Playwright）'],
    tools: ['Vue 3', 'Nuxt 4', 'TypeScript', 'Tailwind CSS', 'Vite', 'Figma'],
  },
  {
    id: 'backend',
    name: '網頁後端',
    nameEn: 'Backend',
    color: '#7cc8ff',
    summary: '設計清楚的 RESTful API，讓資料流穩定地在前後端之間移動。',
    strengths: ['RESTful API 設計', '可擴展的後端架構', '驗證與權限', '排程與背景工作'],
    tools: ['ASP.NET Core', 'FastAPI', 'Express.js', 'Supabase', 'C#'],
  },
  {
    id: 'database',
    name: '資料庫',
    nameEn: 'Database',
    color: '#a99bff',
    summary: '先把資料模型想清楚，查詢和報表自然就簡單。',
    strengths: ['關聯式資料庫設計', 'E-R Diagram', 'SQL 查詢與調校', 'SQLite 本地儲存'],
    tools: ['SQL Server', 'PostgreSQL', 'MySQL', 'SQLite'],
  },
  {
    id: 'agent',
    name: '雲端與 Agent 工具',
    nameEn: 'Cloud & Agents',
    color: '#ffb86b',
    summary: '寫給 AI agent 操作的 CLI，搭配自架服務與雲端部署，讓自動化可以被檢查。',
    strengths: [
      'Agent 友善的 CLI 設計（JSON 輸出、穩定錯誤碼）',
      'Claude Code skills 與 plugin',
      '自架反向代理與監控',
      '雲端部署（IaaS 與 SaaS）',
    ],
    tools: ['Go', 'Claude Code', 'Linux', 'Caddy', 'Google Cloud', 'Azure', 'Vercel', 'Git'],
  },
  {
    id: 'bio',
    name: '資料與生物研究',
    nameEn: 'Data & Biology',
    color: '#ff7eb6',
    summary: '從野外採樣到統計圖表，整條資料流我都做過。',
    strengths: ['eDNA 採樣與分析', 'DNA 萃取、PCR、凝膠電泳', '潮間帶與溪流魚類調查', '科學寫作與統計繪圖'],
    tools: ['Python', 'Pandas', 'R', 'BLAST+', 'Cutadapt', 'USEARCH'],
  },
];
