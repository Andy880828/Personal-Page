/**
 * 海洋科學內容層：整站的「深度」都用這裡的函式換算成物理量，
 * 每一段的科學註記與來源也集中在這裡。數值是公開教材的常見概略值，不是量測資料。
 */

export interface Zone {
  id: 'epipelagic' | 'mesopelagic' | 'bathypelagic' | 'abyssopelagic';
  zh: string;
  alias: string;
  en: string;
  from: number;
  to: number;
  blurb: string;
}

export const ZONES: readonly Zone[] = [
  {
    id: 'epipelagic',
    zh: '透光帶',
    alias: '陽光帶',
    en: 'Epipelagic',
    from: 0,
    to: 200,
    blurb: '陽光足以支持光合作用的一層。大約 100 m 處只剩表層 1% 的光，200 m 是慣用的下界。',
  },
  {
    id: 'mesopelagic',
    zh: '中層帶',
    alias: '曙光帶',
    en: 'Mesopelagic',
    from: 200,
    to: 1000,
    blurb: '還有一點微光，但不夠光合作用。永久溫躍層在這裡，水溫隨深度急遽下降。',
  },
  {
    id: 'bathypelagic',
    zh: '深層帶',
    alias: '午夜帶',
    en: 'Bathypelagic',
    from: 1000,
    to: 4000,
    blurb: '完全沒有陽光，唯一的光來自生物發光。溫度接近 4 °C 以下，壓力超過 100 大氣壓。',
  },
  {
    id: 'abyssopelagic',
    zh: '深淵帶',
    alias: '深海平原',
    en: 'Abyssopelagic',
    from: 4000,
    to: 6000,
    blurb: '深海平原從這裡開始，覆蓋地球大半的海床。水溫約 1–2 °C。',
  },
] as const;

export function zoneAt(depth: number): Zone {
  return ZONES.find((z) => depth < z.to) ?? ZONES[ZONES.length - 1]!;
}

/** 每下潛 10 m 約增加 1 大氣壓（海面本身是 1 atm） */
export function pressureAtm(depth: number): number {
  return 1 + Math.max(0, depth) / 10;
}

/**
 * 典型亞熱帶西北太平洋（黑潮流域附近）的年平均溫度剖面，概略值：
 * 表層暖水、200–1000 m 的永久溫躍層、1000 m 以下接近 4 °C 再緩慢降到 1.5 °C。
 */
const TEMP_PROFILE: [number, number][] = [
  [0, 25.5],
  [50, 24.5],
  [100, 22],
  [150, 20],
  [200, 17.5],
  [300, 14],
  [400, 11],
  [500, 8.5],
  [600, 7],
  [800, 5.2],
  [1000, 4.2],
  [1500, 3.0],
  [2000, 2.4],
  [3000, 1.8],
  [4000, 1.5],
  [6000, 1.2],
];

export function temperatureC(depth: number): number {
  const d = Math.max(0, depth);
  for (let i = 1; i < TEMP_PROFILE.length; i++) {
    const [d0, t0] = TEMP_PROFILE[i - 1]!;
    const [d1, t1] = TEMP_PROFILE[i]!;
    if (d <= d1) return t0 + ((t1 - t0) * (d - d0)) / (d1 - d0);
  }
  return TEMP_PROFILE[TEMP_PROFILE.length - 1]![1];
}

/**
 * 光的衰減：I(z) = I0 · e^(−k·z)。
 * 清澈大洋的可見光（PAR）約 k ≈ 0.046 /m，也就是 100 m 處剩 1%。
 * 各波段差很多：紅光 10 m 內幾乎吸光、綠光可到 100 m 左右、藍光最深。
 */
export const ATTENUATION = {
  par: 0.046,
  red: 0.35,
  green: 0.07,
  blue: 0.025,
} as const;

export function lightFraction(depth: number, k: number = ATTENUATION.par): number {
  return Math.exp(-k * Math.max(0, depth));
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) =>
  String(n)
    .split('')
    .map((c) => (c === '-' ? '⁻' : SUP[Number(c)]))
    .join('');

/** 格式化成表層光的比例：1% 以上用百分比，更小的用 10 的次方（曙光帶還有微光，不寫成 0） */
export function formatLight(fraction: number): string {
  if (fraction >= 0.01) return `${(fraction * 100).toFixed(0)}%`;
  if (fraction >= 1e-4) return `${(fraction * 100).toPrecision(2)}%`;
  if (fraction < 1e-30) return '0';
  return `10${sup(Math.round(Math.log10(fraction)))}`;
}

/** 斯涅爾窗：水下往上看，整個天空被壓縮在約 97° 的圓錐內（2·asin(1/1.33)） */
export const SNELL_WINDOW_DEG = (2 * (Math.asin(1 / 1.33) * 180)) / Math.PI;

export interface ScienceNote {
  /** 對應的段落 id */
  section: 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'contact';
  title: string;
  body: string;
  /** 這一段畫面裡對應的現象 */
  seen: string;
  sources: number[];
}

export const SOURCES: { id: number; title: string; url: string }[] = [
  {
    id: 1,
    title: 'Exploring Our Fluid Earth（夏威夷大學）：Light in the Ocean',
    url: 'https://manoa.hawaii.edu/exploringourfluidearth/physical/ocean-depths/light-ocean',
  },
  {
    id: 2,
    title: 'Introduction to Oceanography：6.5 Light',
    url: 'https://pressbooks.ccconline.org/introduction-to-oceanography/chapter/6-5-light/',
  },
  {
    id: 3,
    title: 'NOAA Ocean Service：What is marine snow?',
    url: 'https://oceanservice.noaa.gov/facts/marinesnow.html',
  },
  {
    id: 4,
    title:
      'Martini & Haddock (2017) Scientific Reports：Quantification of bioluminescence from the surface to the deep sea',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5379559/',
  },
  {
    id: 5,
    title: 'Scientific American：Greatest Migration on Earth Happens under Darkness Every Day',
    url: 'https://www.scientificamerican.com/article/greatest-migration-on-earth-happens-under-darkness-every-day',
  },
  {
    id: 6,
    title: 'LibreTexts Oceanography：12.1 Zones of Marine Environments',
    url: 'https://geo.libretexts.org/Bookshelves/Oceanography/Oceanography_(Hill)/12:_Marine_Environments/12.1:_Zones_of_Marine_Environments',
  },
  {
    id: 7,
    title:
      'Miya et al. (2015) Royal Society Open Science：MiFish, a set of universal PCR primers for metabarcoding environmental DNA from fishes',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4632578/',
  },
  {
    id: 8,
    title: 'NOAA Ocean Exploration：Hydrothermal vents',
    url: 'https://oceanexplorer.noaa.gov/facts/vents.html',
  },
];

export const NOTES: ScienceNote[] = [
  {
    section: 'hero',
    title: '海面：光的入口',
    body: '陽光進入海水後，每個波段被吸收的速度不同：紅光在最上面 10 m 內幾乎消失，藍光可以傳到最深。這就是為什麼水下照片越深越藍。',
    seen: '夕陽的光帶只在海面；一潛下去，紅色就不見了。',
    sources: [1, 2],
  },
  {
    section: 'about',
    title: '透光帶 0–200 m',
    body: '這一層的光足以支持光合作用，整個海洋食物網大部分從這裡開始。大約 100 m 處只剩表層 1% 的光。',
    seen: '斜射的光束、海雪與魚群，都是透光帶的日常。',
    sources: [1, 6],
  },
  {
    section: 'skills',
    title: '環境 DNA（eDNA）',
    body: '魚在水裡留下的黏液、鱗片與排泄物都帶有 DNA。取一瓶水、過濾、萃取、用 12S 或 COI 引子做 PCR 再定序，比對資料庫就能列出這條溪裡有哪些魚，不用抓到牠。我的碩士論文與 Trim2Sort 做的就是這件事。',
    seen: '右邊的雙螺旋：五個技能像五個基因，被讀出來。',
    sources: [7],
  },
  {
    section: 'projects',
    title: '中層帶 200–1000 m：曙光帶',
    body: '每天黃昏，數十億噸的浮游動物與小魚從這裡往上游到表層覓食，天亮再回來，是地球上最大規模的遷徙。往下飄的「海雪」則是深海食物的主要來源。',
    seen: '海雪一路往上飄（因為你在下潛），水母在微光裡發光。',
    sources: [3, 5, 6],
  },
  {
    section: 'experience',
    title: '深層帶 1000–4000 m：午夜帶',
    body: '完全沒有陽光，水溫約 4 °C 以下，壓力超過 100 大氣壓。長達 17 年的 ROV 影像統計顯示，這裡 76% 的動物能自己發光。',
    seen: '一閃一閃的光點是浮游生物的生物發光，不是星星。',
    sources: [4, 6],
  },
  {
    section: 'contact',
    title: '海床 4000 m：熱泉',
    body: '壓力約 400 大氣壓。海底熱泉噴出的流體可達約 400 °C，因為壓力太大所以不會沸騰；周圍的細菌靠化學合成而不是陽光取得能量，養活整個群落。',
    seen: '黑煙囪與上升的熱泉粒子，地面的微光是棲息在海床的發光生物。',
    sources: [8],
  },
];

export function noteFor(section: ScienceNote['section']): ScienceNote {
  return NOTES.find((n) => n.section === section)!;
}
