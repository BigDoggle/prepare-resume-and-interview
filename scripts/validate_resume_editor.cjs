#!/usr/bin/env node
/**
 * 验证生成后的 HTML 简历是否具备基本在线编辑能力，并检查 A4 页面溢出。
 * 用法：node validate_resume_editor.cjs /absolute/path/to/dist/index.html
 */

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function main() {
  const htmlArgument = process.argv[2];
  if (!htmlArgument) {
    throw new Error("请传入生成后 index.html 的绝对路径");
  }

  const htmlPath = path.resolve(htmlArgument);
  const executablePath = process.env.RESUME_CHROME_PATH
    || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });

  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const editableCount = await page.locator("[data-field]").count();
    if (editableCount === 0) {
      throw new Error("未发现任何 data-field 在线编辑字段");
    }
    if (!(await page.locator(".editor-toolbar").isVisible())) {
      throw new Error("在线编辑工具栏不可见");
    }

    const nameField = page.locator('[data-field="profile.name"]');
    const originalName = (await nameField.textContent()).trim();
    const testName = `${originalName}-编辑测试`;
    await nameField.fill(testName);
    await nameField.dispatchEvent("input");
    const storedBeforeReload = await page.evaluate(() => localStorage.getItem("prepare-resume-and-interview:classic-blue-a4"));
    await page.reload({ waitUntil: "networkidle" });
    const persistedName = (await page.locator('[data-field="profile.name"]').textContent()).trim();
    if (persistedName !== testName) {
      const storedAfterReload = await page.evaluate(() => localStorage.getItem("prepare-resume-and-interview:classic-blue-a4"));
      throw new Error(
        `编辑内容未能通过 localStorage 持久化：编辑后=${storedBeforeReload}；刷新后=${storedAfterReload}；页面值=${persistedName}`,
      );
    }

    await page.locator('[data-action="reset"]').click();
    const resetName = (await page.locator('[data-field="profile.name"]').textContent()).trim();
    if (resetName !== originalName) {
      throw new Error("恢复原稿功能未恢复姓名字段");
    }

    const pageChecks = await page.locator(".resume-page").evaluateAll((pages) =>
      pages.map((element, index) => ({
        page: index + 1,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflow: element.scrollHeight > element.clientHeight + 1,
      })),
    );
    if (pageChecks.some((item) => item.overflow)) {
      throw new Error(`检测到 A4 页面溢出：${JSON.stringify(pageChecks)}`);
    }

    console.log(JSON.stringify({ editableCount, persisted: true, reset: true, pageChecks }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
