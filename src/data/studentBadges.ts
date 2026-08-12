/** شارات الطلاب/الفرق — يمنحها رائد النشاط يدويًا (الطلاب أسماء بلا حسابات). */
export interface BadgeDef { key: string; emoji: string; name: string; desc: string }

export const BADGES: BadgeDef[] = [
  { key: "participation", emoji: "🏅", name: "نجم المشاركة", desc: "حضور وحماس دائم في النشاط" },
  { key: "teamspirit", emoji: "🤝", name: "روح الفريق", desc: "قدّم فريقه على نفسه" },
  { key: "thinker", emoji: "🧠", name: "المفكّر", desc: "أفكار عميقة وحلول ذكية" },
  { key: "challenger", emoji: "🔥", name: "المتحدّي", desc: "لا يتراجع أمام أيّ تحدٍّ" },
  { key: "leader", emoji: "👑", name: "القائد", desc: "قاد فريقه بثقة واقتدار" },
  { key: "star", emoji: "⭐", name: "نجم النشاط", desc: "الأبرز والأكثر تميّزًا هذا الأسبوع" },
];

export const badgeDef = (key: string) => BADGES.find((b) => b.key === key);
