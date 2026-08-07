/**
 * يرسم صفحات ملفات الوزارة صورًا PNG باستخدام pdf.js داخل كروم.
 *
 * السبب: خطوط هذه الملفات بلا خريطة Unicode، فـ pdftotext يخرج فراغات،
 * ونص الدرايف يخرج معكوسًا بلا طريقة آمنة لعكسه، وتحويل Google Docs فشل.
 * الرسم كصورة هو المصدر الوحيد الموثوق لقراءة العربية كما هي مطبوعة.
 *
 * الاستخدام:
 *   node tools/render-pdf.mjs <مسار الملف> [أول صفحة] [آخر صفحة]
 *
 * المخرجات: tools/rendered/<اسم الملف>/page-NN.png
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const OUT_ROOT = path.join(HERE, "rendered");

const [, , pdfPath, fromArg, toArg] = process.argv;
if (!pdfPath) {
  console.error("الاستخدام: node tools/render-pdf.mjs <مسار الملف> [أول صفحة] [آخر صفحة]");
  process.exit(1);
}

const pdfBytes = fs.readFileSync(pdfPath);
const outDir = path.join(OUT_ROOT, path.basename(pdfPath, ".pdf"));
fs.mkdirSync(outDir, { recursive: true });

/** خادم مؤقت: pdf.js وحدة ESM ولا يمكن استيرادها من about:blank أو file://. */
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!doctype html><meta charset='utf-8'><body style='margin:0'></body>");
    return;
  }
  if (req.url === "/pdf.pdf") {
    res.writeHead(200, { "Content-Type": "application/pdf" });
    res.end(pdfBytes);
    return;
  }
  const file = path.join(ROOT, "node_modules", "pdfjs-dist", "build", path.basename(req.url));
  if (fs.existsSync(file)) {
    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    res.end(fs.readFileSync(file));
    return;
  }
  res.writeHead(404).end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
  defaultViewport: { width: 1200, height: 1600 },
});

const page = await browser.newPage();
page.on("pageerror", (e) => console.error("خطأ في الصفحة:", String(e)));
await page.goto(origin, { waitUntil: "load" });

const result = await page.evaluate(
  async ({ from, to }) => {
    const pdfjsLib = await import("/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

    const doc = await pdfjsLib.getDocument({ url: "/pdf.pdf" }).promise;
    const first = from || 1;
    const last = Math.min(to || doc.numPages, doc.numPages);
    const pages = [];

    for (let n = first; n <= last; n++) {
      const pdfPage = await doc.getPage(n);
      // مقياس ٢ يجعل النص العربي الصغير مقروءًا
      const viewport = pdfPage.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await pdfPage.render({ canvasContext: ctx, viewport, canvas }).promise;
      pages.push({ n, dataUrl: canvas.toDataURL("image/png") });
    }

    return { total: doc.numPages, pages };
  },
  { from: fromArg ? Number(fromArg) : null, to: toArg ? Number(toArg) : null }
);

for (const { n, dataUrl } of result.pages) {
  const file = path.join(outDir, `page-${String(n).padStart(2, "0")}.png`);
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(file);
}

console.log(`صفحات الملف: ${result.total} | رُسم: ${result.pages.length}`);

await browser.close();
server.close();
