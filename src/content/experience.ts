import type { ExperienceItem } from './types';

/** 由新到舊（跟 git log 一樣新的在上）；第一筆 end 為 null 代表進行中 */
export const experience: ExperienceItem[] = [
  {
    start: '2026/04',
    end: null,
    title: '資料探勘、流程數位化與 Agent 應用',
    org: '個人專案',
    kind: 'build',
    note: 'syssec、local-transcribe、scout、homelab 等',
  },
  // 台郡的工作成果待站主提供後放進 highlights（不編）
  { start: '2025/04', end: '2026/03', title: '數據分析工程師', org: '台郡科技', kind: 'work' },
  { start: '2024/06', end: '2024/11', title: '全端就業養成班', org: '資展國際', kind: 'edu' },
  { start: '2024/01', end: '2024/02', title: '研究助理', org: '國立中山大學', kind: 'work', minor: true },
  {
    start: '2023/06',
    end: '2023/09',
    title: '打工度假',
    org: '美國黃石公園 BearPaw Deli',
    kind: 'abroad',
    minor: true,
  },
  {
    start: '2021/09',
    end: '2023/11',
    title: '碩士',
    org: '國立中山大學海洋科學系研究所',
    kind: 'edu',
    note: '研究溪流環境 DNA',
  },
  { start: '2019/07', end: '2019/08', title: '實習鯨豚解說員', org: '海鯨號', kind: 'work', minor: true },
  { start: '2017/09', end: '2021/06', title: '學士', org: '國立中山大學海洋科學系', kind: 'edu' },
];
