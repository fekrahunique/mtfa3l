import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.28, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}{" "}
    </motion.span>
  );
}

export function WordReveal({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.3"],
  });

  const words = lines.join(" ").split(" ");

  return (
    <div ref={ref} className="mx-auto max-w-[680px] text-center">
      <p
        className="font-display text-4xl leading-tight text-ink sm:text-5xl md:text-6xl"
        dir="rtl"
      >
        {words.map((word, i) => (
          <Word key={`${word}-${i}`} word={word} index={i} total={words.length} progress={scrollYProgress} />
        ))}
      </p>
    </div>
  );
}
