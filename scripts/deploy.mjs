// نشر مجلد dist إلى فرع gh-pages (GitHub Pages) — يُشغَّل بعد البناء عبر `npm run deploy`.
// المصادقة عبر مساعد اعتماد git المُهيّأ من gh (لا يُخزَّن أي مفتاح هنا).
import { execSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";

const REMOTE = "https://github.com/fekrahunique/mtfa3l.git";
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit" });

if (!existsSync("dist/index.html")) {
  console.error("dist غير موجود — شغّل vite build أولًا");
  process.exit(1);
}

writeFileSync("dist/.nojekyll", "");

run("git init -q", "dist");
run("git checkout -q -b gh-pages", "dist");
run("git add -A", "dist");
run('git -c user.email="noreply@anthropic.com" -c user.name="deploy" commit -qm "deploy"', "dist");
run(`git push -f "${REMOTE}" gh-pages`, "dist");

// تنظيف مستودع النشر المؤقّت داخل dist
run(process.platform === "win32" ? "rmdir /s /q .git" : "rm -rf .git", "dist");

console.log("\n✅ نُشِر إلى https://fekrahunique.github.io/mtfa3l/");
