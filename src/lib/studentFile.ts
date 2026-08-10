import { readSheet } from "read-excel-file/browser";
import type { Student } from "./theme";

function makeId(index: number) {
  return `std-${Date.now()}-${index}`;
}

const headerHints = ["اسم", "الطالب", "الطالبة", "الرقم", "name", "id"];

function isHeaderRow(value: string) {
  const trimmed = value.trim();
  return headerHints.some((hint) => trimmed.includes(hint)) && trimmed.length < 20;
}

function looksLikeName(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

export async function parseStudentFile(file: File): Promise<Student[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "xlsx") {
    const rows = await readSheet(file);
    const names: string[] = [];
    rows.forEach((row, rowIndex) => {
      for (const cell of row) {
        const value = String(cell ?? "").trim();
        if (!value) continue;
        if (rowIndex === 0 && isHeaderRow(value)) break;
        if (looksLikeName(value)) {
          names.push(value);
          break;
        }
      }
    });
    return names.map((name, i) => ({ id: makeId(i), name }));
  }

  if (ext === "docx") {
    const { extractRawText } = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await extractRawText({ arrayBuffer });
    const lines = value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((line, i) => (i === 0 && isHeaderRow(line) ? false : looksLikeName(line)));
    return lines.map((name, i) => ({ id: makeId(i), name }));
  }

  throw new Error("صيغة الملف غير مدعومة. ارفع ملف إكسل بصيغة xlsx أو ملف وورد بصيغة docx.");
}

export function generateUsername(schoolName: string) {
  const base = schoolName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("-")
    .replace(/[^ء-يa-zA-Z0-9-]/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base || "نشاط"}-${suffix}`;
}
