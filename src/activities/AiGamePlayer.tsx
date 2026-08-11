import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { noDot } from "../lib/utils";

/**
 * مشغّل ألعاب الوكيل الذكي — يشغّل لعبة HTML مكتفية ذاتيًا في إطار معزول (sandbox)
 * بلا وصول لأصل الموقع (allow-scripts فقط) حفاظًا على الأمان.
 */
export function AiGamePlayer({ title, html, onClose }: { title: string; html: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex flex-col bg-[#0b0b14]"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <X className="h-5 w-5" /> خروج
        </button>
        <span className="flex items-center gap-2 font-display text-white">
          <span className="text-sm text-amber-300">🤖 صنعها الوكيل الذكي</span>
          <span className="truncate">{noDot(title)}</span>
        </span>
        <span className="w-16" />
      </div>
      <iframe
        title={title}
        srcDoc={html}
        sandbox="allow-scripts allow-modals allow-popups"
        className="w-full flex-1 border-0 bg-white"
      />
    </motion.div>
  );
}
