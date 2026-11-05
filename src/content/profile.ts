export const profile = {
  name: '林敬勛',
  nameEn: 'Ching-Hsun Lin',
  role: 'Data & Workflow Engineer',
  roleSecond: 'Oceanography M.S.',
  roleZh: '資料與流程工程師，海洋科學出身',
  hometown: '高雄',
  intro: [
    '我來自高雄，在中山大學讀完海洋科學系學士與碩士，碩士研究溪流的環境 DNA（eDNA）。',
    '後來轉進軟體：先在資展國際學全端網站（Vue、ASP.NET），再到台郡科技做資料分析。現在做三件事：資料探勘與視覺化、流程數位化，以及讓 Agent（會自己呼叫工具、跑完多個步驟的程式）接手重複的工作。',
    '我喜歡把亂掉的資料整理成別人能驗證的系統，不管那份資料來自一條溪、一台伺服器，還是一份減脂挑戰賽的 InBody 報告。',
  ],
  /** 公開的聯絡信箱（站主同意公開） */
  email: 'andy0010502@gmail.com',
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
    { name: 'PADI 進階開放水域潛水員', value: 'AOW' },
  ],
  interests: ['登山', '潛水', '衝浪', '旅遊', '唱歌', '看魚', '玩遊戲'],
} as const;
