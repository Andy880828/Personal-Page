export const profile = {
  name: '林敬勛',
  nameEn: 'Ching-Hsun Lin',
  role: 'Full-stack & Data Engineer',
  roleSecond: 'Oceanographer',
  roleZh: '全端與資料工程師，海洋科學出身',
  hometown: '高雄',
  intro: [
    '我來自高雄，在中山大學讀完海洋科學系與研究所，碩士做的是溪流環境 DNA（eDNA）。',
    '後來轉進軟體：從 Vue、ASP.NET 的全端網站，到台郡科技的數據分析，再到現在專心做「給 AI agent 用的工具」與自架服務。',
    '我喜歡把混亂的資料整理成可以被驗證的系統，不管那份資料來自一條溪、一台伺服器，還是一份減脂挑戰賽的 InBody 報告。',
  ],
  links: {
    github: 'https://github.com/Andy880828',
    facebook:
      'https://www.facebook.com/people/%E6%9E%97%E6%95%AC%E5%8B%9B/pfbid0zu3HuzQ6gFtLzC57gRiKSMiQKBY6b5Tj9zJmYn7UvUqx7b2P11smR9yTbqVtA4a3l/',
    resume: 'https://rxresu.me/andy880828/literary-polite-sparrow',
  },
  certificates: [
    { name: 'TOEIC Listening & Reading', value: '910' },
    { name: 'TOEIC Writing', value: '170' },
    { name: 'TOEIC Speaking', value: '160' },
    { name: 'PADI Advanced Open Water Diver', value: 'AOW' },
  ],
  interests: ['登山', '潛水', '衝浪', '旅遊', '唱歌', '看魚', '玩遊戲'],
} as const;
