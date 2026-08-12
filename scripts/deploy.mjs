// نشر مجلد dist إلى فرع gh-pages (GitHub Pages) — يُشغَّل بعد البناء عبر `npm run deploy`.
// المصادقة عبر رمز gh (gh auth token) — لا يُخزَّن أي مفتاح في الملف.
import { execSync } from "node:child_process";
import { writeFileSync, existsSync, rmSync } from "node:fs";

const OWNER = "fekrahunique/mtfa3l";
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit" });

if (!existsSync("dist/index.html")) {
  console.error("dist غير موجود — شغّل vite build أولًا");
  process.exit(1);
}

let token = "";
try { token = execSync("gh auth token").toString().trim(); } catch { /* لا يوجد gh */ }
if (!token) {
  console.error("تعذّر الحصول على رمز gh — سجّل الدخول عبر `gh auth login`");
  process.exit(1);
}

writeFileSync("dist/.nojekyll", "");
rmSync("dist/.git", { recursive: true, force: true });

run("git init -q", "dist");
run("git checkout -q -b gh-pages", "dist");
run("git add -A", "dist");
run('git -c user.email="noreply@anthropic.com" -c user.name="deploy" commit -qm "deploy"', "dist");
run(`git push -f "https://x-access-token:${token}@github.com/${OWNER}.git" gh-pages`, "dist");
rmSync("dist/.git", { recursive: true, force: true });

console.log("\n✅ نُشِر إلى https://fekrahunique.github.io/mtfa3l/");
