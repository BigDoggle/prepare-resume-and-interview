/**
 * 从 JSON 数据生成静态 HTML。
 * 日常更新简历时优先修改 content/resume.json，无需直接改生成文件。
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderResume } from "../src/template.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const inputPath = path.join(projectRoot, "content", "resume.json");
const outputDir = path.join(projectRoot, "dist");
const outputPath = path.join(outputDir, "index.html");

const data = JSON.parse(await readFile(inputPath, "utf8"));
const html = renderResume(data);

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, html, "utf8");

console.log(`已生成 HTML：${outputPath}`);
