/**
 * الهوية البصرية تتغيّر بحسب موضوع نشاط الأسبوع — الثيم والخلفية والمؤثرات.
 * كل مناسبة تُرجع لوحة ألوان ونوع زينة يستهلكهما مشهد لوحة التحكم ثلاثي
 * الأبعاد وطبقة العرض فوقه. أسبوع بلا موضوع معروف يرجع لتيمة محايدة هادئة.
 */
import type { BreakWeek } from "../data/breakPeriods";

export type WeekDecor = "national" | "media" | "cyber" | "space" | "generic";

export interface WeekTheme {
  decor: WeekDecor;
  occasion: string | null;
  slogan: string | null;

  skyTop: string;
  skyBottom: string;
  sunPosition: [number, number, number];
  ground: string;
  path: string;

  wall: string;
  wallTrim: string;
  roof: string;
  window: string;

  accent: string;
  accentSoft: string;
  banner: string;
  bannerInk: string;
}

/** اليوم الوطني — أخضر وطني ونخيل وأعلام. */
const NATIONAL: WeekTheme = {
  decor: "national",
  occasion: null,
  slogan: null,
  skyTop: "#8fd0c4",
  skyBottom: "#eaf6ef",
  sunPosition: [40, 26, -18],
  ground: "#5a9d5f",
  path: "#d8cdb0",
  wall: "#f1ead8",
  wallTrim: "#12513C",
  roof: "#0B3B2E",
  window: "#bfe6dd",
  accent: "#1E9E63",
  accentSoft: "#2FBF78",
  banner: "#0B3B2E",
  bannerInk: "#F4F1E8",
};

/** التربية الإعلامية — بنفسجي إعلامي وشاشات ومايكروفونات. */
const MEDIA: WeekTheme = {
  decor: "media",
  occasion: null,
  slogan: null,
  skyTop: "#b9a4e6",
  skyBottom: "#f2ecfb",
  sunPosition: [34, 28, -14],
  ground: "#7f79a6",
  path: "#d7cee8",
  wall: "#efe9fb",
  wallTrim: "#4a3379",
  roof: "#2f2153",
  window: "#d9c6f2",
  accent: "#a855c7",
  accentSoft: "#c77dde",
  banner: "#2f2153",
  bannerInk: "#F6F0FF",
};

/** الأمن السيبراني — أزرق سماوي تقني ودروع وأقفال ومؤثرات رقمية. */
const CYBER: WeekTheme = {
  decor: "cyber",
  occasion: null,
  slogan: null,
  skyTop: "#33507e",
  skyBottom: "#bcd2e8",
  sunPosition: [26, 30, 12],
  ground: "#3f5a6b",
  path: "#9fb6c4",
  wall: "#dde8f2",
  wallTrim: "#173a5e",
  roof: "#0e2438",
  window: "#8fe3f2",
  accent: "#22b8d8",
  accentSoft: "#5fe3f7",
  banner: "#0e2438",
  bannerInk: "#E8FAFF",
};

/** أسبوع الفضاء — سماء كونية بنفسجية وكواكب ونجوم. */
const SPACE: WeekTheme = {
  decor: "space",
  occasion: null,
  slogan: null,
  skyTop: "#1a1a3e",
  skyBottom: "#5b5b8f",
  sunPosition: [30, 34, -10],
  ground: "#33335c",
  path: "#4a4a72",
  wall: "#e9e9f7",
  wallTrim: "#2d2d5a",
  roof: "#16162e",
  window: "#a9a9ff",
  accent: "#8b7fff",
  accentSoft: "#b3a8ff",
  banner: "#16162e",
  bannerInk: "#F1F0FF",
};

/** تيمة محايدة لأي موضوع بلا هوية معروفة بعد. */
const GENERIC: WeekTheme = {
  decor: "generic",
  occasion: null,
  slogan: null,
  skyTop: "#9fc6ef",
  skyBottom: "#eef4fb",
  sunPosition: [30, 30, 10],
  ground: "#8ec278",
  path: "#c9c3b4",
  wall: "#e3d6bd",
  wallTrim: "#cdbb9c",
  roof: "#b8613f",
  window: "#8ec6e8",
  accent: "#2bab9f",
  accentSoft: "#45c9bb",
  banner: "#1f1f1f",
  bannerInk: "#f5f2ea",
};

/** يستنتج التيمة من نصّ المناسبة والشعار. */
export function resolveTheme(occasion: string | null, slogan: string | null): WeekTheme {
  const text = `${occasion ?? ""} ${slogan ?? ""}`;
  let base = GENERIC;
  if (/سيبراني|أمن رقمي|اختراق/.test(text)) base = CYBER;
  else if (/إعلام|صحاف|أخبار/.test(text)) base = MEDIA;
  else if (/فضاء|كواكب|نجوم|رواد الفضاء|فلك/.test(text)) base = SPACE;
  else if (/وطني|اليوم الوطني|السعودي|عزّنا|عزنا|تأسيس|العلم|الوعي المستنير|هوية|مواطنة|انتماء|حياكم|قيمنا/.test(text)) base = NATIONAL;
  return { ...base, occasion, slogan };
}

/** يستنتج التيمة من موضوع الأسبوع. */
export function weekTheme(week: BreakWeek | null): WeekTheme {
  if (!week) return GENERIC;
  return resolveTheme(week.occasion ?? null, week.slogan ?? null);
}
