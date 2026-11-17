export const profile = {
  name: '林敬勛',
  nameEn: 'Ching-Hsun Lin',
  role: 'Data & Workflow Engineer',
  roleSecond: 'Oceanography M.S.',
  roleZh: '資料與流程工程師，海洋科學出身',
  /** 首屏的一句定位 */
  tagline: '我擅長把一團亂的資料，整理成別人讀得懂的東西。',
  hometown: '高雄',
  intro: [
    '我來自高雄，學士與碩士皆就讀中山海科系，碩論做溪流的環境 DNA（eDNA）。',
    '畢業後轉往網頁開發：先在資展國際上全端班（Vue、ASP.NET），再到台郡科技當數據分析工程師。現在主要做三件事：資料分析與視覺化、把靠紙本和 Excel 的流程搬上系統，還有設計讓 AI agent 來代勞重複的工作。',
  ],
  /** 公開的聯絡信箱（站主同意公開） */
  email: 'andy0010502@gmail.com',
  links: {
    github: 'https://github.com/Andy880828',
    facebook:
      'https://www.facebook.com/people/%E6%9E%97%E6%95%AC%E5%8B%9B/pfbid0zu3HuzQ6gFtLzC57gRiKSMiQKBY6b5Tj9zJmYn7UvUqx7b2P11smR9yTbqVtA4a3l/',
    resume: 'https://rx.cv/andy880828/mandarin-version',
  },
  certificates: [
    { name: 'TOEIC Listening & Reading', value: '910' },
    { name: 'TOEIC Writing', value: '170' },
    { name: 'TOEIC Speaking', value: '160' },
    { name: 'PADI 進階開放水域潛水員', value: 'AOW' },
  ],
  interests: ['登山', '潛水', '衝浪', '旅遊', '唱歌', '看魚', '玩遊戲'],
} as const;
