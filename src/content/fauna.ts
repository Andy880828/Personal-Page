import type { SectionId } from '@/lib/sections';

/**
 * 依深度帶的代表生物：每一段至少一種，深度範圍要落在所屬分層裡（tests/unit/fauna.test.ts 檢查）。
 * model 是 public/models/<model>.glb（由 scripts/models 從 raw/models 產生）；null 是程序式幾何。
 * 授權與作者在 public/models/LICENSES.md。
 */
export interface Species {
  id: string;
  nameZh: string;
  /** 學名或英文名 */
  name: string;
  section: SectionId;
  depth: [number, number];
  model: string | null;
  /** tier 1 每一層只載一種模型；true 的那一種會載 */
  primary?: boolean;
}

export const FAUNA: Species[] = [
  // 海面：水面下隱約的魚影（就是透光帶的魚群，游到淺處只剩影子）
  { id: 'surface-school', nameZh: '水面下的魚影', name: 'Schooling fish', section: 'hero', depth: [2, 8], model: null },

  // 透光帶、礁區
  {
    id: 'snooty-wrasse',
    nameZh: '狐鯛',
    name: 'Bodianus oxycephalus',
    section: 'about',
    depth: [15, 60],
    model: 'snooty-wrasse',
    primary: true,
  },
  {
    id: 'red-naped-wrasse',
    nameZh: '紅項擬隆頭魚',
    name: 'Pseudolabrus eoethinus',
    section: 'about',
    depth: [10, 40],
    model: 'red-naped-wrasse',
  },
  { id: 'damselfish', nameZh: '雀鯛', name: 'Damselfish', section: 'about', depth: [10, 30], model: 'damselfish' },
  {
    id: 'brain-coral',
    nameZh: '腦珊瑚',
    name: 'Brain coral',
    section: 'about',
    depth: [10, 40],
    model: 'brain-coral',
  },
  { id: 'pavona-coral', nameZh: '葉狀珊瑚', name: 'Pavona', section: 'about', depth: [10, 50], model: 'pavona-coral' },
  {
    id: 'soft-coral',
    nameZh: '軟珊瑚',
    name: 'Soft corals',
    section: 'about',
    depth: [10, 50],
    model: 'soft-coral-set',
  },

  // 透光帶下緣
  { id: 'reef-school', nameZh: '小型魚群', name: 'Schooling fish', section: 'skills', depth: [100, 180], model: null },
  {
    id: 'sea-fan',
    nameZh: '柳珊瑚',
    name: 'Gorgonian',
    section: 'skills',
    depth: [100, 200],
    model: 'coral',
    primary: true,
  },

  // 中層帶
  { id: 'lanternfish', nameZh: '燈籠魚群', name: 'Myctophidae', section: 'projects', depth: [300, 1000], model: null },
  {
    id: 'siphonophore',
    nameZh: '管水母',
    name: 'Praya dubia',
    section: 'projects',
    depth: [300, 1000],
    model: 'siphonophore',
    primary: true,
  },
  { id: 'jellyfish', nameZh: '水母', name: 'Medusae', section: 'projects', depth: [200, 1000], model: null },

  // 深層帶
  {
    id: 'anglerfish',
    nameZh: '鮟鱇魚',
    name: 'Ceratioidei',
    section: 'experience',
    depth: [1000, 3800],
    model: 'anglerfish',
    primary: true,
  },

  // 海床、熱泉
  {
    id: 'giant-isopod',
    nameZh: '大王具足蟲',
    name: 'Bathynomus giganteus',
    section: 'contact',
    depth: [3800, 4000],
    model: 'giant-isopod',
    primary: true,
  },
  { id: 'tubeworm', nameZh: '管蟲叢', name: 'Riftia pachyptila', section: 'contact', depth: [3800, 4000], model: null },
];

/** 用得到的模型（不重複） */
export const MODEL_SLUGS = [...new Set(FAUNA.flatMap((f) => (f.model ? [f.model] : [])))];
