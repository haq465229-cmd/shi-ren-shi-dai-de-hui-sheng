import { type PointerEvent, useState } from 'react';
import arches from './assets/6eDQtCLsCd8BYhrs-transparent.png';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import chroniclesArcade from './assets/chronicles-v2/chronicles-stage.png';
import baloluthBook from './assets/geography/baloluth.png';
import emeraldIslesBook from './assets/geography/emerald-isles.png';
import geographyStage from './assets/geography/geography-stage.png';
import larsinaBook from './assets/geography/larsina.png';
import nineRealmsBook from './assets/geography/nine-realms.png';
import spiceLandsBook from './assets/geography/spice-lands.png';
import theJadeBook from './assets/geography/the-jade.png';
import tierialandBook from './assets/geography/tierialand.png';
import vinlandBook from './assets/geography/vinland.png';
import wasteMarchesBook from './assets/geography/waste-marches.png';
import heroicBook from './assets/chronicles-v2/heroic-cover.png';
import knownWorldBook from './assets/chronicles-v2/known-world-cover.png';
import legendsBook from './assets/chronicles-v2/legends-cover.png';
import heroComposite from './assets/Hb381Ycho45qeCoc.webp';
import heroStageClean from './assets/Hb381Ycho45qeCoc-stage-clean.png';
import reflection from './assets/rpw5S7Y7iCAxfIa7-transparent.png';
import textLogo from './assets/text-plane/tieria-logo.png';
import textPoem from './assets/text-plane/poem.png';
import textTitle from './assets/text-plane/poetic-title.png';
import statue from './assets/ZxYVF4luJcHYh622-transparent.png';
import {
  tieriaBooks,
  type BookContent,
  type ContentArticle,
  type ContentBlock,
  type ContentSection,
  type SubheadingRef,
} from './data/tieriaContent';

const assets = {
  heroComposite,
  heroStageClean,
  chroniclesArcade,
  geographyStage,
  heroicBook,
  legendsBook,
  knownWorldBook,
  tierialandBook,
  wasteMarchesBook,
  spiceLandsBook,
  nineRealmsBook,
  larsinaBook,
  vinlandBook,
  baloluthBook,
  emeraldIslesBook,
  theJadeBook,
  textLogo,
  textTitle,
  textPoem,
  statue,
  arches,
  reflection,
};

const MAX_TEXT_PLANE_TILT = 7;
const MAX_SECTION_TEXT_TILT_Y = 6;
const MAX_SECTION_TEXT_TILT_X = 2.2;
const MAX_CHRONICLES_HEADER_SHIFT = 12;
const MAX_GEOGRAPHY_HEADER_SHIFT = 12;
const BOOK_ACTIVATION_MS = 720;

const pageEntries = {
  chronicles: {
    title: '\u7f16\u5e74\u53f2\u4e0e\u738b\u7edf',
    english: 'Chronicles & Royal Lineage',
    note:
      '\u8fd9\u91cc\u5c06\u6536\u5bb9 TIERIA \u7684\u738b\u7edf\u3001\u5e74\u8868\u4e0e\u5927\u4e8b\u8bb0\u3002',
  },
  geography: {
    title: '\u5730\u7406\u4e0e\u65b9\u7c7b',
    english: 'Geographies And Orders',
    note:
      '\u8fd9\u91cc\u5c06\u6536\u5bb9\u5927\u5730\u3001\u65cf\u7c7b\u3001\u57ce\u90a6\u4e0e\u65b9\u4f4d\u7684\u7d22\u5f15\u3002',
  },
  poetic: {
    title: '\u6700\u540e\u7684\u8bd7\u4eba\u65f6\u4ee3',
    english: 'The Last Poetic Age',
    note:
      '\u8fd9\u91cc\u5c06\u901a\u5411\u5e8f\u7ae0\u3001\u8bd7\u7bc7\u4e0e\u90a3\u4e2a\u88ab\u79f0\u4f5c\u6700\u7f8e\u65f6\u4ee3\u7684\u4f20\u8bf4\u3002',
  },
} as const;

type PageKey = keyof typeof pageEntries;

const backLabel = '\u8fd4\u56de\u67f1\u5eca';

const chronicleVolumes = [
  {
    key: 'heroic',
    className: 'volume-heroic',
    image: heroicBook,
    alt: 'Return, Passing and Heroic Epics book cover.',
    caption:
      '\u5f52\u6765\u3001\u901d\u53bb\u4e0e\u82f1\u96c4\u53f2\u8bd7\u3002\u5173\u4e8e\u82f1\u96c4\u3001\u6218\u4e89\u4e0e\u547d\u8fd0\u8f6e\u56de\u7684\u53e4\u8001\u541f\u6e38\u3002',
  },
  {
    key: 'legends',
    className: 'volume-legends',
    image: legendsBook,
    alt: 'Legends, History and Unfinished Deeds book cover.',
    caption:
      '\u4f20\u8bf4\u3001\u5386\u53f2\u4e0e\u672a\u7adf\u4e4b\u4e1a\u3002\u8bb0\u8f7d\u738b\u56fd\u5174\u8870\u4e0e\u5148\u884c\u8005\u672a\u7adf\u4e4b\u5fd7\u3002',
  },
  {
    key: 'known-world',
    className: 'volume-known',
    image: knownWorldBook,
    alt: 'Records of the Known World book cover.',
    caption:
      '\u5df2\u77e5\u4e16\u754c\u5fd7\u3002\u7ed8\u5236\u5927\u9646\u3001\u8c31\u5199\u4e0e\u5e1d\u56fd\u7684\u77e5\u8bc6\u5178\u85cf\u3002',
  },
] as const;

type ChronicleVolumeKey = (typeof chronicleVolumes)[number]['key'];

const geographyVolumes = [
  {
    key: 'tierialand',
    className: 'region-tierialand',
    image: tierialandBook,
    caption: 'Tierialand.',
  },
  {
    key: 'waste-marches',
    className: 'region-waste-marches',
    image: wasteMarchesBook,
    caption: 'WasteMarches.',
  },
  {
    key: 'spice-lands',
    className: 'region-spice-lands',
    image: spiceLandsBook,
    caption: 'SpiceLands.',
  },
  {
    key: 'nine-realms',
    className: 'region-nine-realms',
    image: nineRealmsBook,
    caption: 'Nine Realms.',
  },
  {
    key: 'larsina',
    className: 'region-larsina',
    image: larsinaBook,
    caption: 'Larsina.',
  },
  {
    key: 'vinland',
    className: 'region-vinland',
    image: vinlandBook,
    caption: 'Vinland.',
  },
  {
    key: 'baloluth',
    className: 'region-baloluth',
    image: baloluthBook,
    caption: 'Baloluth.',
  },
  {
    key: 'emerald-isles',
    className: 'region-emerald-isles',
    image: emeraldIslesBook,
    caption: 'Emerald Isles.',
  },
  {
    key: 'the-jade',
    className: 'region-the-jade',
    image: theJadeBook,
    caption: 'The Jade.',
  },
] as const;

type GeographyVolumeKey = (typeof geographyVolumes)[number]['key'];

type CatalogBookKey = ChronicleVolumeKey | GeographyVolumeKey;

type SiteBookDetail = Omit<BookContent, 'key'> & {
  key: CatalogBookKey;
  image: string;
  stage: string;
  activePage: PageKey;
  returnLabel: string;
};

type CatalogSection = {
  heading: string;
  items: string[];
};

type ParsedCatalogBook = {
  title: string;
  sections: CatalogSection[];
};

type CatalogBookDetail = {
  key: CatalogBookKey;
  title: string;
  intro: string;
  image: string;
  stage: string;
  activePage: PageKey;
  returnLabel: string;
  sections: CatalogSection[];
};

const catalogSource = String.raw`
# 《诗人时代的回声》目录

# 传说、历史与未竟之事

## 混沌、圣树与首生者

## 蒙神、世界与次生者

### 天穹、山峦与海洋

### 白昼、黑夜与光明

### 西风、北风与季候

## 世界、锻铸与诸神

### 先觉天

### 以太海

### 止界

### 极乐地

### 绯红荒野

### 百战世界

### 灵魂海

### 八层地狱

## 尘土、泪水与凡人

# 归来、逝去与英雄史诗

## 太古时代

### 翠月的眼睛

### 忒诺亚-黄金时代与白银时代

### 荒州-诸神之子的崛起

### 巴洛卢瑟-尚葛之乱

### 拉尔斯尼亚-英雄时代的回声

### 翠月往事

### 翡翠的陨落

### 太古时代的终章

## 第一纪元

### 翠月陨落后的世界

### 阿尔诺王国——北方巨人的倒下

### 伊里昂斯王朝——东方巨鹿的陨落

### 五王之战

### 神之采石场之战

### 高崖要塞之战

### 血林之战

### 七戒远征

## 第二纪元-北方王国

### "雄主"赫伦·赫雷斯特与北方王国的黑铁时代

### "血斧"贡纳尔

### 布伦希尔德女王

### 贵族议会摄政时代

### "佣兵王"埃里克

### "铁砧"格恩泰尔

### 芙蕾雅女王

### "守财奴"克雷格

### "傀儡王"英格瓦

### "僭主"洛克

### "悲哀王"奥古斯都

## 第二纪元-帝国

### 老洛克里安的黎明与黄昏

### "百日女王"拉瑞恩

### "疯王"洛克里安二世

### "忠诚的"提耶利亚

### "强腕"阿塔里安

### "短促的贤王"乔拉

### "南境征服者"班克罗夫特

### "昏王"洛克里安三世

### "守成的"弗洛伦斯二世

### "落马者"阿塔里安二世

### "落马者二世"索尔

### "瘫痪的"乔拉三世

### "僭王"洛克里安四世

### "蜡烛般"塞西二世

### "坠落的"大卫

### "迫王"科尔一世

### "复兴者"索尔二世

### "远征王"埃德加一世

### "多谋的"雷纳德三世

### "务实的"科尔二世

### "勇武的"科尔三世

### "征服者"提耶利亚

### "贤王"索尔三世

### "疲王"伊伦奥恩一世

### "烬后者"伊伦奥恩二世

# 已知世界的记载

## 已知世界的地理

## 已知世界的文字体系

### 河西文字

### 北方文字

### 空文

### 幽谷文字

### 诺恩符文

### 高等百湖地语

### 阿妲尔文字

### 太阳文

### 高等阿契尼德文字

### 怀恩里尼文字

### 希阿文字

### 祖扎达尔文字

### 通用语

### 塞尔克南文字

### 汉隶

### 番文

### 回鹘文

### 梵文

### 粟特文

### 诃陵陀文

### 百越图符

## 已知世界的节日

### 耦纹日

### 一如日

### 祭灵日

### 丰收节

### 启航节

### 雪月新年

### 柴薪日

### 炉乡祭

### 苦修月

### 狩日

### 自由日

### 英雄日

### 鹰母祭

### 奥汶日

### 伊斯塔卡祭

### 密特隆日

### 翡翠节

### 圣剑日

### 双子日

### 鹿首节

### 泰沃日

### 满月节

### 阴月

### 春节

### 沐浴日

### 圣火日

### 火花祭

### 中秋节

### 祭天

### 降临日

### 忏悔日

### 圣席尔日

### 香料月与铎尔祭典

### 坎卓尔祭典

## 已知世界的神祇与怪异

### 忒诺亚诸神

### 怀恩里尼诸神

### 香料地诸神

### 拉尔斯尼亚诸神

### 巴罗卢瑟诸神

### 九州诸神

### 荒野诸神

### 翠月精灵诸神

### 侏儒诸神

### 半身人诸神

### 矮人诸神

### 兽人诸神

### 地精诸神

### 巨人诸神

### 龙类诸神

### 巨灵贵族

### 地狱领主

### 海洋怪异

## 已知世界的重要书籍

### 地理与方志类典籍

### 史诗与王统纪

### 宗教与神学典籍

### 民间故事与传说集

### 史诗与英雄纪事

## 已知世界的种族

### 人类

### 精类

### 矮人

### 其余种族

## 已知世界的货币

### 帝国

### 北境

### 香料地

### 怀恩里尼

### 百湖地

### 河洛

## 商品

# 忒诺亚Tierialand

## 帝国

### 开拓、权力与基石

### 传承、王座与灼目皇冠

### 地理、大河与国度

## 北方王国

### 王冠、历史与伤痕

### 传承、王座与巨人之血

### 地理、北风与国度

## 东北诸侯

### 荒原、坚韧与背叛

### 传承、王座与三国的纷争

### 地理、冻土与国度

## 冬群岛

### 海浪、盗匪与困境

### 传承、王庭与北海传说

### 地理、北海与国度

## 北方诸部

### 冻土、严寒与风暴

### 传承、部族与北风史诗

### 地理、大雪与国度

## 百湖地

### 文明、兴衰与纷争

### 传承、王庭与月下往事

### 地理、月光与国度

# 荒州WasteMarches

## 都林之山

### 群山、悲歌与传承

### 地理、山峰与国度

## 伊瑟瑞尔

### 谷地、秘语与存续

### 地理、幽溪与国度

## 卢姆巴尔

### 矿峰、诸侯与铁血

### 地理、岩石与国度

## 大林地

### 古老、隐秘与德鲁伊

### 地理、荒野与国度

## 卡西俄斯

### 长城、辽阔与黄金之路

### 传承、王座与阿契尼德之子

### 地理、平原与国度

## 伯琉雷斯

### 河滩、岁月与商路

### 传承、王座与鞍上史诗

### 地理、旧城与国度

## 奥佩恩

### 海岸、王朝与凯勒

### 地理、港湾与国度

## 红色荒原

### 沙海、祸乱与恐惧

### 地理、驼峰与国度

## 格罗加兹

## 凄凉之地

### 苦寒、妖治与威胁

### 地理、凄凉与国度

## 姐妹会

### 雾岛、继承与存续

### 地理、隔绝与国度

# 香料地SpiceLands

## 降临、冲突与征服

## 大漠、圣香与日冕

## 文字、民俗与种族

## 冠冕、财富与信仰

### 纷争的源头

### 阿妲尔王朝

### 教廷的崛起

### 脆弱的平衡

## 地理、绿洲与国度

### 王畿奥斯蒂亚

### 王冠群岛

### 圣地公国索拉梅尔

### 琥珀山公国古拉尼尔

### 咸水湾公国布拉弥尔

### 旱地公国坦安提尔

### 风间谷公国铎洛弥尔

### 林地公国卢巴纳

### 象地公国韦鲁姆

### 望海崖

# 九州Nine Realms

## 地理、辽阔与国度

### 瀚州

### 苍州

### 菟州

### 羌州

### 中州

### 瀛州

### 沙门州

### 旃州

### 宝瓶州

# 拉尔斯尼亚Larsina

## 泰坦、山脉与海洋

## 传承、王座与远西海风

## 地理、古老与国度

### 拉弗利兹王国

### 罗利内特王国

### 希阿王国

### 斯弥尔王国

# 文兰Vinland

## 传承、财富与古老神秘

## 地理、未知与国度

### 开拓者半岛(The Pioneer Peninsula)

### 蟹群岛(Crab Isles)

### 远西之地(Far West)

### 纳斯帝国(Nasr Empire)

### 奥苏王国(Osu Kingdom)

### 米托-胡恩利兹 (Mitô-Hûnleth)

### 胡古恩长城 (Hugûn Wall)

### 塞外之地

# 巴洛卢瑟Baloluth

## 晦朔、流离与守望

## 传承、王座与旧日回忆

## 地理、黑豹与国度

# 翡翠群岛Emerald Isles

### 地理、家园与国度

# 翠月The Jade

### 荒原、宁静与永恒
`;

function parseCatalog(source: string): ParsedCatalogBook[] {
  const books: ParsedCatalogBook[] = [];
  let currentBook: ParsedCatalogBook | null = null;
  let currentSection: CatalogSection | null = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = /^(#{1,3})\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const [, marker, title] = match;

    if (marker.length === 1) {
      if (title.includes('目录')) {
        currentBook = null;
        currentSection = null;
        continue;
      }

      currentBook = { title, sections: [] };
      currentSection = null;
      books.push(currentBook);
      continue;
    }

    if (!currentBook) {
      continue;
    }

    if (marker.length === 2) {
      currentSection = { heading: title, items: [] };
      currentBook.sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = { heading: '本卷目录', items: [] };
      currentBook.sections.push(currentSection);
    }

    currentSection.items.push(title);
  }

  return books;
}

const parsedCatalogByTitle = new Map(
  parseCatalog(catalogSource).map((book) => [book.title, book.sections]),
);

function sectionsFor(title: string): CatalogSection[] {
  return parsedCatalogByTitle.get(title) ?? [{ heading: '本卷目录', items: [] }];
}

const bookDetails: Record<CatalogBookKey, CatalogBookDetail> = {
  heroic: {
    key: 'heroic',
    title: '归来、逝去与英雄史诗',
    intro: '诸王归来，古史逝去，英雄与时代仍在回响。',
    image: heroicBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
    sections: sectionsFor('归来、逝去与英雄史诗'),
  },
  legends: {
    key: 'legends',
    title: '传说、历史与未竟之事',
    intro: '圣树、诸神、世界与凡人的开端，在未竟之事中留下第一缕回声。',
    image: legendsBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
    sections: sectionsFor('传说、历史与未竟之事'),
  },
  'known-world': {
    key: 'known-world',
    title: '已知世界的记载',
    intro: '文字、节日、神祇、种族与货币，构成已知世界的知识典藏。',
    image: knownWorldBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
    sections: sectionsFor('已知世界的记载'),
  },
  tierialand: {
    key: 'tierialand',
    title: '忒诺亚Tierialand',
    intro: '帝国、北方王国与百湖地，在古老王座与大河之间展开。',
    image: tierialandBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('忒诺亚Tierialand'),
  },
  'waste-marches': {
    key: 'waste-marches',
    title: '荒州WasteMarches',
    intro: '荒原、群山、矿峰与长城，记下边境诸国的坚韧与离散。',
    image: wasteMarchesBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('荒州WasteMarches'),
  },
  'spice-lands': {
    key: 'spice-lands',
    title: '香料地SpiceLands',
    intro: '大漠、圣香、王冠与绿洲，汇成香料地的财富与信仰。',
    image: spiceLandsBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('香料地SpiceLands'),
  },
  'nine-realms': {
    key: 'nine-realms',
    title: '九州Nine Realms',
    intro: '辽阔九州以山川与国度为轴，展开东方大地的秩序。',
    image: nineRealmsBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('九州Nine Realms'),
  },
  larsina: {
    key: 'larsina',
    title: '拉尔斯尼亚Larsina',
    intro: '泰坦、山脉与远西海风，托起古老诸王的传承。',
    image: larsinaBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('拉尔斯尼亚Larsina'),
  },
  vinland: {
    key: 'vinland',
    title: '文兰Vinland',
    intro: '财富、未知与远西之地，写在开拓者海岸之外。',
    image: vinlandBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('文兰Vinland'),
  },
  baloluth: {
    key: 'baloluth',
    title: '巴洛卢瑟Baloluth',
    intro: '晦朔、流离与黑豹守望，留存旧日王座的回忆。',
    image: baloluthBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('巴洛卢瑟Baloluth'),
  },
  'emerald-isles': {
    key: 'emerald-isles',
    title: '翡翠群岛Emerald Isles',
    intro: '翡翠群岛的家园与国度，沉在岛屿、森林与海雾之间。',
    image: emeraldIslesBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('翡翠群岛Emerald Isles'),
  },
  'the-jade': {
    key: 'the-jade',
    title: '翠月The Jade',
    intro: '翠月的荒原、宁静与永恒，像星图一样留在长夜。',
    image: theJadeBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
    sections: sectionsFor('翠月The Jade'),
  },
};

const bookVisuals: Record<
  CatalogBookKey,
  Pick<SiteBookDetail, 'image' | 'stage' | 'activePage' | 'returnLabel'>
> = {
  heroic: {
    image: heroicBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
  },
  legends: {
    image: legendsBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
  },
  'known-world': {
    image: knownWorldBook,
    stage: chroniclesArcade,
    activePage: 'chronicles',
    returnLabel: '返回编年史',
  },
  tierialand: {
    image: tierialandBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  'waste-marches': {
    image: wasteMarchesBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  'spice-lands': {
    image: spiceLandsBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  'nine-realms': {
    image: nineRealmsBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  larsina: {
    image: larsinaBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  vinland: {
    image: vinlandBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  baloluth: {
    image: baloluthBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  'emerald-isles': {
    image: emeraldIslesBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
  'the-jade': {
    image: theJadeBook,
    stage: geographyStage,
    activePage: 'geography',
    returnLabel: '返回地理与方类',
  },
};

const contentBookDetails = tieriaBooks.reduce(
  (details, book) => {
    const key = book.key as CatalogBookKey;
    details[key] = { ...book, key, ...bookVisuals[key] };
    return details;
  },
  {} as Record<CatalogBookKey, SiteBookDetail>,
);

type SectionNavProps = {
  activePage: PageKey;
  onOpenPage: (page: PageKey) => void;
};

function SectionNav({ activePage, onOpenPage }: SectionNavProps) {
  const entries: PageKey[] = ['chronicles', 'geography', 'poetic'];

  return (
    <nav className="section-nav" aria-label="TIERIA sections">
      {entries.map((entry) => (
        <button
          aria-current={activePage === entry ? 'page' : undefined}
          className={activePage === entry ? 'is-active' : undefined}
          key={entry}
          type="button"
          onClick={() => onOpenPage(entry)}
        >
          {pageEntries[entry].title}
        </button>
      ))}
    </nav>
  );
}

type HeroStageProps = {
  onOpenPage: (page: PageKey) => void;
};

function HeroStage({ onOpenPage }: HeroStageProps) {
  function handleTextPlaneTilt(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const offset = (event.clientX - centerX) / (rect.width / 2);
    const relativeX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const glowRadius = Math.max(92, Math.min(168, rect.width * 0.075));
    const tilt = Math.max(-1, Math.min(1, offset)) * MAX_TEXT_PLANE_TILT;

    event.currentTarget.style.setProperty('--tilt-y', `${tilt.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--spot-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-radius', `${glowRadius.toFixed(0)}px`);
    event.currentTarget.style.setProperty('--cursor-glow', '1');
  }

  function resetTextPlaneTilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
    event.currentTarget.style.setProperty('--spot-radius', '0px');
    event.currentTarget.style.setProperty('--cursor-glow', '0');
  }

  return (
    <section className="hero-stage" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        TIERIA, Echoes Of The Poetic Age
      </h1>

      <div className="desktop-stage">
        <div
          className="desktop-composition"
          onPointerLeave={resetTextPlaneTilt}
          onPointerMove={handleTextPlaneTilt}
        >
          <img className="desktop-hero-image" src={assets.heroStageClean} alt="" aria-hidden="true" />
          <div className="cursor-light-field" aria-hidden="true">
            <span className="cursor-halo cursor-halo-trail" />
            <span className="cursor-halo cursor-halo-main" />
          </div>
          <div className="desktop-text-plane">
            <img className="text-plane-item text-plane-logo" src={assets.textLogo} alt="" aria-hidden="true" />
            <img className="text-plane-item text-plane-title" src={assets.textTitle} alt="" aria-hidden="true" />
            <img className="text-plane-item text-plane-poem" src={assets.textPoem} alt="" aria-hidden="true" />
            <nav className="hero-nav" aria-label="TIERIA sections">
              <button type="button" onClick={() => onOpenPage('chronicles')}>
                {pageEntries.chronicles.title}
              </button>
              <button type="button" onClick={() => onOpenPage('geography')}>
                {pageEntries.geography.title}
              </button>
              <button
                className="hero-nav-primary"
                type="button"
                onClick={() => onOpenPage('poetic')}
              >
                {pageEntries.poetic.title}
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="mobile-stage">
        <img className="mobile-arches" src={assets.arches} alt="" aria-hidden="true" />
        <div className="mobile-brand" aria-label="TIERIA">
          TIERIA
        </div>
        <img
          className="mobile-statue"
          src={assets.statue}
          alt="Marble muse holding a lyre."
        />
        <img className="mobile-reflection" src={assets.reflection} alt="" aria-hidden="true" />
        <div className="mobile-taxonomy-actions" aria-label="TIERIA sections">
          <button type="button" onClick={() => onOpenPage('chronicles')}>
            {pageEntries.chronicles.title}
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => onOpenPage('geography')}>
            {pageEntries.geography.title}
          </button>
        </div>
        <h2>Echoes Of The Poetic Age</h2>
        <p className="mobile-poem">
          Amid a falling blaze of burning light, a meteor cleft the heavens.
        </p>
        <button
          className="mobile-enter"
          type="button"
          onClick={() => onOpenPage('poetic')}
        >
          {pageEntries.poetic.title}
          <span>Enter the Poetic Age</span>
        </button>
      </div>
    </section>
  );
}

type ChroniclesPageProps = {
  onBack: () => void;
  onOpenBook: (book: ChronicleVolumeKey) => void;
  onOpenPage: (page: PageKey) => void;
};

function ChroniclesPage({ onBack, onOpenBook, onOpenPage }: ChroniclesPageProps) {
  const [activatedVolume, setActivatedVolume] = useState<ChronicleVolumeKey | null>(null);
  const activationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (activationTimerRef.current) {
        window.clearTimeout(activationTimerRef.current);
      }
    };
  }, []);

  function activateVolume(volumeKey: ChronicleVolumeKey) {
    setActivatedVolume(volumeKey);

    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
    }

    activationTimerRef.current = window.setTimeout(() => {
      setActivatedVolume((currentVolume) => (currentVolume === volumeKey ? null : currentVolume));
    }, BOOK_ACTIVATION_MS);
  }

  function handleChroniclesPointerMove(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (event.clientX - centerX) / (rect.width / 2);
    const offsetY = (event.clientY - centerY) / (rect.height / 2);
    const relativeX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const glowRadius = Math.max(92, Math.min(168, rect.width * 0.075));
    const headerShift = Math.max(-1, Math.min(1, offsetY)) * MAX_CHRONICLES_HEADER_SHIFT;
    const textTiltY = Math.max(-1, Math.min(1, offsetX)) * MAX_SECTION_TEXT_TILT_Y;
    const textTiltX = Math.max(-1, Math.min(1, offsetY)) * -MAX_SECTION_TEXT_TILT_X;

    event.currentTarget.style.setProperty('--chronicles-header-y', `${headerShift.toFixed(1)}px`);
    event.currentTarget.style.setProperty('--section-text-tilt-y', `${textTiltY.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--section-text-tilt-x', `${textTiltX.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--spot-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-radius', `${glowRadius.toFixed(0)}px`);
    event.currentTarget.style.setProperty('--cursor-glow', '1');
  }

  function resetChroniclesPointer(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty('--chronicles-header-y', '0px');
    event.currentTarget.style.setProperty('--section-text-tilt-y', '0deg');
    event.currentTarget.style.setProperty('--section-text-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--spot-radius', '0px');
    event.currentTarget.style.setProperty('--cursor-glow', '0');
  }

  return (
    <section
      className="chronicles-page"
      aria-labelledby="chronicles-title"
      onPointerLeave={resetChroniclesPointer}
      onPointerMove={handleChroniclesPointerMove}
    >
      <img className="chronicles-bg" src={assets.chroniclesArcade} alt="" aria-hidden="true" />
      <div className="chronicles-light-field cursor-light-field" aria-hidden="true">
        <span className="cursor-halo cursor-halo-trail" />
        <span className="cursor-halo cursor-halo-main" />
      </div>
      <div className="section-text-plane chronicles-text-plane">
        <header className="chronicles-topbar">
          <button className="chronicles-brand" type="button" onClick={onBack}>
            TIERIA
          </button>
          <SectionNav activePage="chronicles" onOpenPage={onOpenPage} />
        </header>

        <div className="chronicles-copy">
          <h1 id="chronicles-title">
            Chronicles &amp;
            <br />
            Royal Lineage
          </h1>
          <p>The memory of kings, unfinished deeds, and the order of the known world.</p>
          <span className="chronicles-rule" aria-hidden="true" />
          <button className="chronicles-back" type="button" onClick={onBack}>
            {backLabel}
          </button>
        </div>
      </div>

      <div className="chronicles-volumes" aria-label="Chronicle volumes">
        {chronicleVolumes.map((volume) => (
          <button
            aria-label={volume.caption}
            className={`chronicle-volume ${volume.className}${
              activatedVolume === volume.key ? ' is-activated' : ''
            }`}
            key={volume.key}
            type="button"
            onClick={() => {
              activateVolume(volume.key);
              window.setTimeout(() => onOpenBook(volume.key), 120);
            }}
          >
            <img className="chronicle-cover" src={volume.image} alt="" aria-hidden="true" />
            <img className="chronicle-cover-reflection" src={volume.image} alt="" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

type GeographyPageProps = {
  onBack: () => void;
  onOpenBook: (book: GeographyVolumeKey) => void;
  onOpenPage: (page: PageKey) => void;
};

function GeographyPage({ onBack, onOpenBook, onOpenPage }: GeographyPageProps) {
  const [activatedRegion, setActivatedRegion] = useState<GeographyVolumeKey | null>(null);
  const activationTimerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const keyboardPanRef = useRef(0);

  useEffect(() => {
    return () => {
      if (activationTimerRef.current) {
        window.clearTimeout(activationTimerRef.current);
      }
    };
  }, []);

  function activateRegion(regionKey: GeographyVolumeKey) {
    setActivatedRegion(regionKey);

    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
    }

    activationTimerRef.current = window.setTimeout(() => {
      setActivatedRegion((currentRegion) => (currentRegion === regionKey ? null : currentRegion));
    }, BOOK_ACTIVATION_MS);
  }

  function handleGeographyPointerMove(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const panorama = event.currentTarget.querySelector<HTMLElement>('.geography-panorama');
    const centerY = rect.top + rect.height / 2;
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const offsetY = (event.clientY - centerY) / (rect.height / 2);
    const relativeX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const extraWidth = panorama ? Math.max(0, panorama.getBoundingClientRect().width - rect.width) : 0;
    const panRatio = Math.max(-1, Math.min(1, offsetX));
    const panX = panRatio * extraWidth * -0.5;
    const headerShift = Math.max(-1, Math.min(1, offsetY)) * MAX_GEOGRAPHY_HEADER_SHIFT;
    const glowRadius = Math.max(92, Math.min(168, rect.width * 0.075));
    const textTiltY = panRatio * MAX_SECTION_TEXT_TILT_Y;
    const textTiltX = Math.max(-1, Math.min(1, offsetY)) * -MAX_SECTION_TEXT_TILT_X;

    keyboardPanRef.current = panRatio;
    event.currentTarget.style.setProperty('--geography-pan-x', `${panX.toFixed(1)}px`);
    event.currentTarget.style.setProperty('--geography-header-y', `${headerShift.toFixed(1)}px`);
    event.currentTarget.style.setProperty('--section-text-tilt-y', `${textTiltY.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--section-text-tilt-x', `${textTiltX.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--spot-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-x', `${(relativeX * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--trail-y', `${(relativeY * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--spot-radius', `${glowRadius.toFixed(0)}px`);
    event.currentTarget.style.setProperty('--cursor-glow', '1');
  }

  function resetGeographyPointer(event: PointerEvent<HTMLElement>) {
    keyboardPanRef.current = 0;
    event.currentTarget.style.setProperty('--geography-pan-x', '0px');
    event.currentTarget.style.setProperty('--geography-header-y', '0px');
    event.currentTarget.style.setProperty('--section-text-tilt-y', '0deg');
    event.currentTarget.style.setProperty('--section-text-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--spot-radius', '0px');
    event.currentTarget.style.setProperty('--cursor-glow', '0');
  }

  function applyKeyboardPan(direction: -1 | 1) {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const panorama = section.querySelector<HTMLElement>('.geography-panorama');
    const extraWidth = panorama
      ? Math.max(0, panorama.getBoundingClientRect().width - section.getBoundingClientRect().width)
      : 0;

    keyboardPanRef.current = Math.max(-1, Math.min(1, keyboardPanRef.current + direction * 0.22));
    const panX = keyboardPanRef.current * extraWidth * -0.5;

    section.style.setProperty('--geography-pan-x', `${panX.toFixed(1)}px`);
    section.style.setProperty('--spot-radius', '0px');
    section.style.setProperty('--cursor-glow', '0');
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      applyKeyboardPan(event.key === 'ArrowLeft' ? -1 : 1);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <section
      className="geography-page"
      aria-labelledby="geography-title"
      ref={sectionRef}
      onPointerLeave={resetGeographyPointer}
      onPointerMove={handleGeographyPointerMove}
    >
      <div className="geography-panorama">
        <img className="geography-bg" src={assets.geographyStage} alt="" aria-hidden="true" />
        <div className="geography-regions" aria-label="Geography region volumes">
          {geographyVolumes.map((volume) => (
            <button
              aria-label={volume.caption}
              className={`geography-volume ${volume.className}${
                activatedRegion === volume.key ? ' is-activated' : ''
              }`}
              key={volume.key}
              type="button"
              onClick={() => {
                activateRegion(volume.key);
                window.setTimeout(() => onOpenBook(volume.key), 120);
              }}
            >
              <img className="geography-cover" src={volume.image} alt="" aria-hidden="true" />
              <img className="geography-cover-reflection" src={volume.image} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div className="geography-light-field cursor-light-field" aria-hidden="true">
        <span className="cursor-halo cursor-halo-trail" />
        <span className="cursor-halo cursor-halo-main" />
      </div>
      <div className="section-text-plane geography-text-plane">
        <header className="geography-topbar">
          <button className="chronicles-brand" type="button" onClick={onBack}>
            TIERIA
          </button>
          <SectionNav activePage="geography" onOpenPage={onOpenPage} />
        </header>

        <div className="geography-copy">
          <h1 id="geography-title">
            Geography &amp;
            <br />
            Regions
          </h1>
          <p>The shape of lands, forgotten frontiers, and the order of rivers, realms, and roads.</p>
          <span className="chronicles-rule" aria-hidden="true" />
          <button className="chronicles-back" type="button" onClick={onBack}>
            {backLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

type BookDetailPageProps = {
  book: SiteBookDetail;
  onBackHome: () => void;
  onOpenPage: (page: PageKey) => void;
  onReturnToShelf: () => void;
};

function scrollToElement(element: HTMLElement | null) {
  window.requestAnimationFrame(() => {
    element?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    element?.focus({ preventScroll: true });
  });
}

function sectionToArticle(section: ContentSection): ContentArticle {
  return {
    id: section.id,
    title: section.title,
    blocks: section.blocks,
    subheadings: section.subheadings ?? [],
  };
}

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return <p key={`${index}-${block.text.slice(0, 12)}`}>{block.text}</p>;
        }

        if (block.type === 'image') {
          const figureStyle = {
            '--reader-image-width': `${block.width}px`,
          } as CSSProperties;

          return (
            <figure
              className="book-reader-figure"
              key={`${index}-${block.src}`}
              style={figureStyle}
            >
              <img
                alt={block.alt}
                height={block.height}
                loading="lazy"
                src={block.src}
                width={block.width}
              />
            </figure>
          );
        }

        return (
          <h3
            className={`book-reader-subheading book-reader-subheading-level-${block.level}`}
            id={block.id}
            key={block.id}
          >
            {block.title}
          </h3>
        );
      })}
    </>
  );
}

type ReaderNavigationProps = {
  articles: ContentArticle[];
  activeArticleId: string | null;
  subheadings: SubheadingRef[];
  onSelectArticle: (article: ContentArticle) => void;
};

function ReaderNavigation({
  articles,
  activeArticleId,
  subheadings,
  onSelectArticle,
}: ReaderNavigationProps) {
  if (articles.length === 0 && subheadings.length === 0) {
    return null;
  }

  return (
    <aside className="book-subheading-nav" aria-label="阅读目录">
      <p>阅读目录</p>
      <nav>
        {articles.length > 0
          ? articles.map((article) => (
              <div className="book-subheading-group" key={article.id}>
                <button
                  aria-current={activeArticleId === article.id ? 'true' : undefined}
                  className={`book-subheading-link book-subheading-link-level-3${
                    activeArticleId === article.id ? ' is-active' : ''
                  }`}
                  type="button"
                  onClick={() => onSelectArticle(article)}
                >
                  {article.title}
                </button>
                {activeArticleId === article.id
                  ? article.subheadings.map((heading) => (
                      <a
                        className={`book-subheading-link book-subheading-link-level-${heading.level}`}
                        href={`#${heading.id}`}
                        key={heading.id}
                      >
                        {heading.title}
                      </a>
                    ))
                  : null}
              </div>
            ))
          : subheadings.map((heading) => (
              <a
                className={`book-subheading-link book-subheading-link-level-${heading.level}`}
                href={`#${heading.id}`}
                key={heading.id}
              >
                {heading.title}
              </a>
            ))}
      </nav>
    </aside>
  );
}

function BookDetailPage({ book, onBackHome, onOpenPage, onReturnToShelf }: BookDetailPageProps) {
  const initialSectionId = book.sections[0]?.id ?? '';
  const initialArticleId =
    book.sections[0]?.articles[0]?.id ??
    (book.sections.length === 0 ? (book.rootArticles ?? [])[0]?.id ?? null : null);
  const contentsRef = useRef<HTMLElement | null>(null);
  const readerRef = useRef<HTMLElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(initialArticleId);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<'contents' | 'reader' | null>(
    null,
  );
  const rootArticles = book.rootArticles ?? [];
  const prefaceBlocks = book.prefaceBlocks ?? [];
  const activeSection =
    book.sections.find((section) => section.id === activeSectionId) ?? book.sections[0] ?? null;
  const activeArticle =
    activeSection?.articles.find((article) => article.id === activeArticleId) ??
    activeSection?.articles[0] ??
    null;
  const activeRootArticle =
    !activeSection
      ? rootArticles.find((article) => article.id === activeArticleId) ?? rootArticles[0] ?? null
      : null;
  const readerArticleBase =
    activeArticle ??
    activeRootArticle ??
    (activeSection && activeSection.articles.length === 0 ? sectionToArticle(activeSection) : null) ??
    (!activeSection && rootArticles.length === 0 && prefaceBlocks.length > 0
      ? {
          id: `${book.key}-preface`,
          title: book.title,
          blocks: prefaceBlocks,
          subheadings: [],
        }
      : null);
  const readerArticle =
    activeRootArticle && rootArticles[0]?.id === activeRootArticle.id && prefaceBlocks.length > 0
      ? {
          ...activeRootArticle,
          blocks: [...prefaceBlocks, ...activeRootArticle.blocks],
        }
      : readerArticleBase;
  const readerNavArticles = activeSection?.articles ?? (!activeSection ? rootArticles : []);
  const effectiveActiveArticleId = activeArticle?.id ?? activeRootArticle?.id ?? null;
  const readerContextLabel = activeSection?.title ?? (activeRootArticle ? '卷册条目' : book.title);
  const hasReaderArticle = Boolean(readerArticle);

  useEffect(() => {
    setActiveSectionId(initialSectionId);
    setActiveArticleId(initialArticleId);
    setPendingScrollTarget(null);
  }, [book.key, initialArticleId, initialSectionId]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    scrollToElement(pendingScrollTarget === 'contents' ? contentsRef.current : readerRef.current);
    setPendingScrollTarget(null);
  }, [pendingScrollTarget, activeSectionId, activeArticleId]);

  function focusContents() {
    scrollToElement(contentsRef.current);
  }

  function openSection(section: ContentSection) {
    setActiveSectionId(section.id);
    setActiveArticleId(section.articles[0]?.id ?? null);
    setPendingScrollTarget('reader');
  }

  function openArticle(article: ContentArticle) {
    setActiveArticleId(article.id);
    setPendingScrollTarget('reader');
  }

  return (
    <section className="book-detail-page" aria-labelledby={`${book.key}-book-title`}>
      <div className="book-detail-stage" aria-hidden="true">
        <img className="book-detail-bg" src={book.stage} alt="" />
      </div>
      <header className="book-detail-topbar">
        <button className="book-detail-brand" type="button" onClick={onBackHome}>
          TIERIA
        </button>
        <nav className="book-detail-nav" aria-label="TIERIA sections">
          {(['chronicles', 'geography', 'poetic'] as const).map((pageKey) => (
            <button
              aria-current={book.activePage === pageKey ? 'page' : undefined}
              className={book.activePage === pageKey ? 'is-active' : undefined}
              key={pageKey}
              type="button"
              onClick={() => onOpenPage(pageKey)}
            >
              {pageEntries[pageKey].title}
            </button>
          ))}
        </nav>
        <div className="book-detail-tools" aria-label="Book tools">
          <button type="button" aria-label="打开目录" onClick={focusContents}>
            <span className="book-menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="book-hero-layout">
        <div className="book-hero-object" aria-hidden="true">
          <img className="book-hero-cover" src={book.image} alt="" />
        </div>
        <div className="book-hero-copy">
          <h1 id={`${book.key}-book-title`}>{book.title}</h1>
          <span className="book-title-rule" aria-hidden="true" />
          <p>{book.intro}</p>
          <button className="book-return-link" type="button" onClick={onReturnToShelf}>
            {book.returnLabel}
          </button>
        </div>
      </div>

      <section
        className={`book-contents-panel${hasReaderArticle ? ' is-reader-navigation' : ''}`}
        aria-label={`${book.title}目录`}
        ref={contentsRef}
        tabIndex={-1}
      >
        {book.sections.length > 0 ? (
          <div className="book-era-strip" role="tablist" aria-label="选择目录分组">
            {book.sections.map((section) => (
              <button
                aria-selected={activeSection?.id === section.id}
                className={`book-era-tab${activeSection?.id === section.id ? ' is-active' : ''}`}
                key={section.id}
                role="tab"
                type="button"
                onClick={() => openSection(section)}
              >
                {section.title}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {readerArticle ? (
        <section
          className="book-reader-section"
          aria-labelledby={`${readerArticle.id}-title`}
          ref={readerRef}
          tabIndex={-1}
        >
          <article className="book-reader-article">
            <header className="book-reader-header">
              <p>{readerContextLabel}</p>
              <h2 id={`${readerArticle.id}-title`}>{readerArticle.title}</h2>
            </header>
            <div className="book-reader-layout">
              <div className="book-reader-body">
                <ContentBlocks blocks={readerArticle.blocks} />
              </div>
              <ReaderNavigation
                activeArticleId={effectiveActiveArticleId}
                articles={readerNavArticles}
                onSelectArticle={openArticle}
                subheadings={readerArticle.subheadings}
              />
            </div>
          </article>
        </section>
      ) : null}
    </section>
  );
}

type PlaceholderPageProps = {
  page: PageKey;
  onBack: () => void;
  onOpenBook: (book: CatalogBookKey) => void;
  onOpenPage: (page: PageKey) => void;
};

function PlaceholderPage({ page, onBack, onOpenBook, onOpenPage }: PlaceholderPageProps) {
  const entry = pageEntries[page];

  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <img className="placeholder-bg" src={assets.heroComposite} alt="" aria-hidden="true" />
      <header className="placeholder-topbar">
        <button className="chronicles-brand" type="button" onClick={onBack}>
          TIERIA
        </button>
        <SectionNav activePage={page} onOpenPage={onOpenPage} />
      </header>
      <div className="placeholder-panel">
        <p className="placeholder-brand">TIERIA / {entry.english}</p>
        <h1 id="placeholder-title">{entry.title}</h1>
        {page === 'poetic' ? (
          <>
            <p>
              这里是《诗人时代的回声》的阅读导览。正文已经按原稿分为编年史、已知世界与诸地理卷册；
              进入任一卷册后，可以从二级目录继续打开三级条目与正文。
            </p>
            <div className="poetic-guide-actions" aria-label="阅读导览">
              <button type="button" onClick={() => onOpenPage('chronicles')}>
                进入编年史与王统
              </button>
              <button type="button" onClick={() => onOpenPage('geography')}>
                进入地理与方类
              </button>
            </div>
            <div className="poetic-book-list" aria-label="全部卷册">
              {tieriaBooks.map((book) => (
                <button
                  key={book.key}
                  type="button"
                  onClick={() => onOpenBook(book.key as CatalogBookKey)}
                >
                  {book.title}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>{entry.note}</p>
            <p className="placeholder-note">本页内容已经迁入对应卷册，可从导航返回继续阅读。</p>
          </>
        )}
        <button className="back-button" type="button" onClick={onBack} autoFocus>
          {backLabel}
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey | null>(null);
  const [activeBook, setActiveBook] = useState<CatalogBookKey | null>(null);
  const currentBook = activeBook ? contentBookDetails[activeBook] : null;

  function openHome() {
    setActiveBook(null);
    setActivePage(null);
  }

  function openPage(page: PageKey) {
    setActiveBook(null);
    setActivePage(page);
  }

  return (
    <main className="app-shell">
      {currentBook ? (
        <BookDetailPage
          book={currentBook}
          onBackHome={openHome}
          onOpenPage={openPage}
          onReturnToShelf={() => {
            setActiveBook(null);
            setActivePage(currentBook.activePage);
          }}
        />
      ) : activePage === 'chronicles' ? (
        <ChroniclesPage onBack={openHome} onOpenBook={setActiveBook} onOpenPage={openPage} />
      ) : activePage === 'geography' ? (
        <GeographyPage onBack={openHome} onOpenBook={setActiveBook} onOpenPage={openPage} />
      ) : activePage ? (
        <PlaceholderPage
          page={activePage}
          onBack={openHome}
          onOpenBook={setActiveBook}
          onOpenPage={openPage}
        />
      ) : (
        <HeroStage onOpenPage={openPage} />
      )}
    </main>
  );
}
