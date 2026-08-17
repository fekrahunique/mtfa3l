import ts from "typescript";
import fs from "node:fs";
const src = fs.readFileSync("src/data/breakPeriods.ts", "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: "ESNext", target: "ES2020" } }).outputText;
fs.writeFileSync("__bp.mjs", js);
const { breakWeeks } = await import("./__bp.mjs");
const corners = [];
for (const w of breakWeeks) for (const c of w.corners) corners.push({
  id: c.id, week: w.week, stage: w.stage, occasion: w.occasion, slogan: w.slogan,
  title: c.title, outcomes: c.outcomes, values: c.values, place: c.place, steps: c.steps, hasTeach: !!c.teach,
});
fs.writeFileSync("__corners.json", JSON.stringify(corners));
console.log("total:", corners.length, "| done:", corners.filter(c=>c.hasTeach).length, "| need:", corners.filter(c=>!c.hasTeach).length);
