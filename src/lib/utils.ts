import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * يزيل النقطة من نهاية أي نص معروض — قرار عرض بطلب المالك.
 * لا يمسّ نص المصدر، بل يُطبَّق وقت العرض فقط، ويحافظ على النقاط الداخلية.
 */
export function noDot(text: string): string {
  return text.replace(/[.۔]+\s*$/u, "").trimEnd();
}
