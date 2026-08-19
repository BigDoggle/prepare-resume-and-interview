/**
 * 使用固定版本 Chromium 将简历导出为 PDF。
 * 默认不生成 PNG；仅在显式设置 RESUME_GENERATE_PREVIEW=1 时保留逐页预览图。
 * 导出前会检查每张 A4 页面是否发生内容溢出。
 */
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

/**
 * 按“显式配置 → Playwright 浏览器 → 系统浏览器”的顺序查找 Chromium 内核浏览器。
 * 路径覆盖 Windows、macOS 和常见 Linux 发行版，避免写死单一系统路径。
 */
function resolveBrowserExecutable() {
  const explicitPath = process.env.RESUME_CHROME_PATH;
  if (explicitPath) {
    if (!fsSync.existsSync(explicitPath)) {
      throw new Error(`RESUME_CHROME_PATH 指向的文件不存在：${explicitPath}`);
    }
    return explicitPath;
  }

  const playwrightPath = chromium.executablePath();
  if (playwrightPath && fsSync.existsSync(playwrightPath)) {
    return playwrightPath;
  }

  const candidates = [];
  if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else if (process.platform === "win32") {
    for (const root of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]) {
      if (!root) continue;
      candidates.push(
        path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(root, "Chromium", "Application", "chrome.exe"),
      );
    }
  } else {
    for (const command of ["google-chrome", "google-chrome-stable", "microsoft-edge", "chromium", "chromium-browser"]) {
      try {
        const resolved = execFileSync("which", [command], { encoding: "utf8" }).trim();
        if (resolved) candidates.push(resolved);
      } catch {
        // 当前命令不存在时继续尝试下一种浏览器。
      }
    }
  }

  const systemPath = candidates.find((candidate) => fsSync.existsSync(candidate));
  if (systemPath) return systemPath;

  throw new Error(
    `未找到可用的 Chrome、Edge 或 Chromium（系统：${os.platform()}）。`
    + "请先运行环境预检，或通过 RESUME_CHROME_PATH 指定浏览器可执行文件。",
  );
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const htmlPath = path.join(projectRoot, "dist", "index.html");
  const pdfDir = path.join(projectRoot, "output", "pdf");
  const previewDir = path.join(projectRoot, "output", "preview");
  const shouldGeneratePreview = process.env.RESUME_GENERATE_PREVIEW === "1";
  const resumeData = JSON.parse(await fs.readFile(path.join(projectRoot, "content", "resume.json"), "utf8"));
  const safeName = String(resumeData.profile?.name || "resume").replace(/[\\/:*?"<>|]/g, "-");
  const pdfPath = path.join(pdfDir, `${safeName}-HTML简历.pdf`);

  await fs.mkdir(pdfDir, { recursive: true });
  if (shouldGeneratePreview) {
    await fs.mkdir(previewDir, { recursive: true });
  }

  const executablePath = resolveBrowserExecutable();
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 }, deviceScaleFactor: 1.5 });

  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) =>
    Promise.all(images.map((image) => (image.complete ? undefined : image.decode()))),
  );

  const pageChecks = await page.locator(".resume-page").evaluateAll((pages) =>
    pages.map((element, index) => ({
      page: index + 1,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflow: element.scrollHeight > element.clientHeight + 1,
    })),
  );

  const overflowPages = pageChecks.filter((item) => item.overflow);
  if (overflowPages.length > 0) {
    throw new Error(`检测到页面溢出：${JSON.stringify(overflowPages)}`);
  }

  if (shouldGeneratePreview) {
    const pageLocators = page.locator(".resume-page");
    const pageCount = await pageLocators.count();
    for (let index = 0; index < pageCount; index += 1) {
      await pageLocators.nth(index).screenshot({
        path: path.join(previewDir, `page-${index + 1}.png`),
      });
    }
  }

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });

  await browser.close();
  console.log(`页面检查：${JSON.stringify(pageChecks)}`);
  console.log(`已生成 PDF：${pdfPath}`);
  if (shouldGeneratePreview) {
    console.log(`已生成 PNG 预览：${previewDir}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
