/**
 * استخراج نصّ من الملفات الوصفية للمسابقات داخل المتصفح — بلا خادم.
 * يدعم: نصّي/CSV/Markdown، وWord (.docx)، وPDF، وExcel (.xlsx).
 * المكتبات تُحمَّل عند الحاجة فقط (import ديناميكي) كي لا تثقل الحزمة الأساسية.
 */

export interface ExtractResult {
  text: string;
  note?: string; // ملاحظة تُعرض للمستخدم (قصور جزئي، حدّ صفحات، إلخ)
}

export async function extractFileText(file: File): Promise<ExtractResult> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = name.endsWith(".docx");
  const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");

  if (isPdf) return extractPdf(file);
  if (isDocx) return extractDocx(file);
  if (isXlsx) return extractXlsx(file);
  if (name.endsWith(".doc")) return { text: "", note: "صيغة .doc القديمة غير مدعومة، احفظ الملف بصيغة .docx" };

  // نصّي (txt/csv/md/text)
  const text = await file.text();
  return { text };
}

async function extractDocx(file: File): Promise<ExtractResult> {
  // النسخة المتصفّحية من mammoth (حزمة UMD مستقلّة)
  const mod = (await import("mammoth/mammoth.browser.js")) as unknown as {
    default?: { extractRawText(o: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }> };
    extractRawText?: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const mammoth = mod.default ?? mod;
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText!({ arrayBuffer });
  return { text: value };
}

async function extractPdf(file: File): Promise<ExtractResult> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const max = Math.min(doc.numPages, 20);
  let out = "";
  for (let p = 1; p <= max; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  const note = doc.numPages > max ? `قرأت أول ${max} صفحة من ${doc.numPages}` : undefined;
  return { text: out, note };
}

async function extractXlsx(file: File): Promise<ExtractResult> {
  const readXlsx = (await import("read-excel-file/browser")).default as unknown as (f: File) => Promise<unknown[][]>;
  const rows = await readXlsx(file);
  const text = rows.map((r) => r.map((c) => (c == null ? "" : String(c))).join(" | ")).join("\n");
  return { text };
}
