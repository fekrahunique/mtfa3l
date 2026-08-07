import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileArrowUp, FileXls, FileDoc, Trash, WarningCircle } from "@phosphor-icons/react";
import { ScrollReveal } from "../../components/ScrollReveal";
import { parseStudentFile } from "../../lib/studentFile";
import type { Student } from "../../lib/theme";
import { cn } from "../../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

export function StepStudents({
  students,
  onChange,
}: {
  students: Student[];
  onChange: (students: Student[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("loading");
    setFileName(file.name);
    try {
      const parsed = await parseStudentFile(file);
      if (parsed.length === 0) {
        setError("ما لقينا أي أسماء في الملف. تأكد إن الأسماء موجودة في العمود الأول.");
        setStatus("error");
        return;
      }
      onChange(parsed);
      setStatus("idle");
    } catch {
      setError("تعذّرت قراءة الملف. تأكد إن الصيغة xlsx أو docx وإن الملف غير تالف.");
      setStatus("error");
    }
  }

  return (
    <ScrollReveal className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink">رفع ملف الطلاب</h2>
        <p className="mt-1 text-sm text-ink-faint">ملف إكسل (xlsx) أو وورد (docx) فيه أسماء الطلاب.</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          dragOver ? "border-sun-400 bg-sun-400/5" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <FileArrowUp weight="duotone" className="h-10 w-10 text-sun-400" />
        <p className="text-base text-ink">اسحب الملف هنا أو اضغط للاختيار</p>
        <p className="text-sm text-ink-faint">xlsx, docx</p>
      </div>

      {status === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-11 animate-pulse rounded-xl bg-white/[0.06]"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex items-start gap-3 rounded-xl border border-girls-500/40 bg-girls-500/10 px-4 py-3 text-sm text-girls-300"
          >
            <WarningCircle weight="fill" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {students.length > 0 && status !== "loading" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              {fileName.endsWith(".docx") ? (
                <FileDoc weight="duotone" className="h-5 w-5 text-sun-400" />
              ) : (
                <FileXls weight="duotone" className="h-5 w-5 text-sun-400" />
              )}
              {fileName || "قائمة الطلاب"}
            </div>
            <span className="text-sm text-ink-faint">{students.length} طالب</span>
          </div>
          <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-white/10 p-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink transition-colors duration-300 hover:bg-white/[0.05]"
              >
                <span>{student.name}</span>
                <button
                  type="button"
                  onClick={() => onChange(students.filter((s) => s.id !== student.id))}
                  aria-label={`إزالة ${student.name}`}
                  className="text-ink-faint transition-colors hover:text-girls-400"
                >
                  <Trash weight="bold" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ScrollReveal>
  );
}
