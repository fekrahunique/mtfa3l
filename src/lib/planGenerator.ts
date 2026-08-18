/**
 * مولّد «المخطط الذكي» — يقترح خطة أسابيع من المحتوى الحقيقي في المنصة:
 * تحديات المستودع (حسب المرحلة والمجال) + المناسبات + الألعاب الكبرى.
 * دالة نقيّة (تُستدعى عند الضغط)، والمحتوى مصدره data/ideaVault.
 */

import { vaultCategories, type VaultStage } from "../data/ideaVault";
import { TRIAL_MODE } from "./subscriptionStore";

export type PlanStage = "ابتدائي" | "متوسط";

export interface PlanItem {
  emoji: string;
  title: string;
  kind: string;      // «لعبة كبرى» | «مناسبة» | اسم المجال
  tag?: string;
  route?: string;    // للألعاب الكبرى
}
export interface PlanWeek { week: number; items: PlanItem[] }

const GAMES = [
  { emoji: "🏆", title: "بطولة نشاط", route: "/بطولة-نشاط" },
  { emoji: "🔐", title: "لعبة الشفرة", route: "/الشفرة" },
  { emoji: "⚡", title: "آخر فرصة", route: "/آخر-فرصة" },
];

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/**
 * المجالات المتاحة للاختيار (تُستثنى المناسبات، لأن لها مفتاحًا مستقلًا في PlanOptions).
 * في وضع التجربة (TRIAL_MODE) تُدرَج حزمة النخبة أيضًا بلا قفل.
 */
export const PLAN_DOMAINS = vaultCategories
  .filter((c) => (TRIAL_MODE || !c.premium) && c.id !== "occasions")
  .map((c) => ({ id: c.id, title: c.title, emoji: c.emoji }));

export interface PlanOptions {
  stage: PlanStage;
  weeks: number;
  perWeek: number;
  domainIds: string[];
  occasions: boolean;
}

export function generatePlan(opts: PlanOptions): PlanWeek[] {
  const { stage, weeks, perWeek, domainIds, occasions } = opts;
  const stageOk = (s: VaultStage) => s === stage || s === "المرحلتان";

  const cats = vaultCategories.filter((c) => domainIds.includes(c.id));
  const pools = cats.map((c) => ({ emoji: c.emoji, title: c.title, items: shuffle(c.challenges.filter((ch) => stageOk(ch.stage))) }));
  const occCat = vaultCategories.find((c) => c.id === "occasions");
  const occPool = occasions && occCat ? shuffle(occCat.challenges.filter((ch) => stageOk(ch.stage))) : [];
  const gamePool = shuffle(GAMES);

  // جدول أنواع الخانة الأولى لكل أسبوع
  const kinds: ("domain" | "game" | "occasion")[] = Array(weeks).fill("domain");
  for (let i = weeks - 1; i >= 0; i -= 4) kinds[i] = "game"; // ختام + كل ٤ أسابيع لعبة كبرى
  if (occPool.length) {
    let placed = 0;
    const cap = Math.min(occPool.length, Math.ceil(weeks / 3));
    for (let i = 1; i < weeks && placed < cap; i += 3) {
      if (kinds[i] === "domain") { kinds[i] = "occasion"; placed++; }
    }
  }

  let di = 0, gi = 0, oi = 0;
  const used = new Set<string>();
  const takeDomain = (): PlanItem | null => {
    for (let n = 0; n < pools.length; n++) {
      const pool = pools[(di + n) % pools.length];
      const item = pool.items.find((ch) => !used.has(ch.title));
      if (item) {
        used.add(item.title);
        di = (di + n + 1) % pools.length;
        return { emoji: pool.emoji, title: item.title, kind: pool.title, tag: item.tag };
      }
    }
    return null;
  };

  const plan: PlanWeek[] = [];
  for (let w = 0; w < weeks; w++) {
    const items: PlanItem[] = [];
    if (kinds[w] === "game") {
      const g = gamePool[gi % gamePool.length]; gi++;
      items.push({ emoji: g.emoji, title: g.title, kind: "لعبة كبرى", route: g.route });
    } else if (kinds[w] === "occasion") {
      const o = occPool[oi % occPool.length]; oi++;
      if (o) items.push({ emoji: "🌍", title: o.title, kind: "مناسبة", tag: o.tag });
      else { const d = takeDomain(); if (d) items.push(d); }
    } else {
      const d = takeDomain(); if (d) items.push(d);
    }
    for (let p = 1; p < perWeek; p++) { const d = takeDomain(); if (d) items.push(d); }
    plan.push({ week: w + 1, items });
  }
  return plan;
}
