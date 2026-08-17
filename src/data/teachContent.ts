import type { TeachContent } from "./breakPeriods";

/**
 * المحتوى التعليمي الكامل لكل ركن (مفتاحه معرّف الركن).
 * يُستكمَل تلقائيًا؛ ويُستخدَم في العرض عبر: corner.teach ?? teachContent[corner.id].
 */
export const teachContent: Record<string, TeachContent> = {};
