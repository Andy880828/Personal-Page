import type { SkillGroup } from './types';

/** 主方向在前：資料探勘 → 資料視覺化 → 流程數位化 → Agent 應用 → 全端網站 */
export const skills: SkillGroup[] = [
  {
    id: 'mining',
    name: '資料探勘',
    nameEn: 'Data Mining',
    color: '#4ff0d2',
    summary:
      '一條溪的 eDNA 定序、一家工廠的產線紀錄、我自己的投資紀錄，都是同一套步驟：清理、比對、檢定，最後寫成別人能重現的分析筆記。',
    strengths: [
      '資料清理與特徵工程',
      '統計檢定與時間序列',
      'eDNA 定序資料處理（剪引子、去重、BLAST 比對）',
      '分析流程可重現（程式與筆記一起交付）',
    ],
    tools: ['Python', 'Pandas', 'R', 'SQL', 'BLAST+', 'Cutadapt', 'USEARCH'],
  },
  {
    id: 'viz',
    name: '資料視覺化',
    nameEn: 'Data Visualization',
    color: '#7cc8ff',
    summary: '讓圖表先回答問題，再談好看；這個網站本身就是一張把深度換算成壓力、水溫、光的圖。',
    strengths: ['圖表選型與尺度（線性、對數）', '互動式與 3D 視覺化', '配色與可讀性'],
    tools: ['Matplotlib', 'Three.js'],
  },
  {
    id: 'workflow',
    name: '流程數位化',
    nameEn: 'Workflow Digitization',
    color: '#a99bff',
    summary: '把靠人記、靠 Excel 傳的流程做成系統：表單、排程、報表、通知，而且出錯看得到。',
    strengths: ['需求盤點與資料模型', '表單與審核流程', '排程與背景工作', '自架服務與監控'],
    tools: ['ASP.NET Core', 'FastAPI', 'Supabase', 'SQL Server', 'PostgreSQL', 'Caddy', 'Linux', 'Vercel'],
  },
  {
    id: 'agent',
    name: 'Agent 應用',
    nameEn: 'Agent Applications',
    color: '#ffb86b',
    summary: '讓程式替人跑完整段流程（查漏洞、整理資訊、轉逐字稿），每一步的輸出都留下來，可以逐步檢查。',
    strengths: [
      '讓其他程式直接呼叫的指令列工具（固定格式的 JSON 輸出與錯誤碼）',
      '把流程拆成小步驟，限定每一步能讀寫的範圍',
      '本地執行與資料不外流',
      '中途失敗可以從那一步重跑',
    ],
    tools: ['Go', 'Python', 'Claude Code', 'LiteLLM', 'Linux'],
  },
  {
    id: 'web',
    name: '全端網站',
    nameEn: 'Full-stack Web',
    color: '#ff7eb6',
    summary: '從切版到 API 到資料庫，一個人把網站做到能上線、能維護。',
    strengths: ['響應式介面', '元件化與狀態管理', 'RESTful API', '關聯式資料庫設計', '前端測試'],
    tools: ['Vue 3', 'Nuxt 4', 'React', 'TypeScript', 'Tailwind CSS', 'Vite', 'C#', 'Express.js', 'Figma'],
  },
];
