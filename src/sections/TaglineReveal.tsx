import { WordReveal } from "../components/WordReveal";

export function TaglineReveal() {
  return (
    <section className="px-4 py-32">
      <WordReveal
        lines={[
          "هنا كل نشاط له معنى، كل مسابقة لها أثر،",
          "ورحلة النشاط تصير تعليم وفائدة وترفيه في آن واحد",
        ]}
      />
    </section>
  );
}
