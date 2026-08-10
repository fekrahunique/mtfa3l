import {
  Megaphone,
  Palette,
  Note,
  Sticker,
  PushPin,
  ChalkboardSimple,
  IdentificationCard,
  PencilSimple,
  Presentation,
  Medal,
  UsersThree,
  Question,
  Gear,
  Flag,
  Hand,
  Confetti,
  Star,
  type Icon,
} from "@phosphor-icons/react";

/**
 * يترجم نص الأداة أو الخطوة إلى أيقونة معبّرة، عبر مطابقة كلمات مفتاحية.
 * لا يخترع محتوى — فقط يختار رمزًا بصريًا لما ورد نصًا في الملف.
 */

function pick(text: string, table: [RegExp, Icon][], fallback: Icon): Icon {
  for (const [re, icon] of table) if (re.test(text)) return icon;
  return fallback;
}

const TOOL_TABLE: [RegExp, Icon][] = [
  [/لاقط|مكبر|صوت/, Megaphone],
  [/ألوان|تلوين/, Palette],
  [/شريط|لاصق|مشابك/, PushPin],
  [/بطاقات|ملصق/, Sticker],
  [/لوحة|حائط/, ChalkboardSimple],
  [/هوية|ملف/, IdentificationCard],
  [/ورق|أوراق|رسم/, Note],
];

export function toolIcon(text: string): Icon {
  return pick(text, TOOL_TABLE, Star);
}

const STEP_TABLE: [RegExp, Icon][] = [
  [/يجهّز|يجهز|تجهيز|جهّز|إعداد|أعدّ/, Gear],
  [/يعلن|إعلان|افتتاح|تحدّي|تحدي/, Megaphone],
  [/يرسم|رسم|يكتب|كتابة|عبارة/, PencilSimple],
  [/يعلّق|يعلق|تعليق|يسلّم|يسلم/, PushPin],
  [/يعرض|تعرض|عرض|لوحة جماعية|تزين/, Presentation],
  [/لجنة|اختيار أفضل|تمييز|إبداع مميز|يكرَّم|يكرم|جائزة/, Medal],
  [/فريق|فريقين|تقسيم|مجموعة/, UsersThree],
  [/سؤال|أسئلة|يطرح|يجيب|إجابة/, Question],
  [/يرفع|أيديهم|يشارك|مشاركة/, Hand],
  [/شعار|الوطن|وطني|علم/, Flag],
  [/تصوير|نشر|وسائل التواصل|احتفال/, Confetti],
];

export function stepIcon(text: string): Icon {
  return pick(text, STEP_TABLE, Star);
}
