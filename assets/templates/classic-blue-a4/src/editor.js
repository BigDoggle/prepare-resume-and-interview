/**
 * 浏览器端简历编辑器：保存本地编辑状态，并支持 JSON 导入导出与照片替换。
 * 浏览器不会静默写回源码；导出的 JSON 可替换 content/resume.json 后重新构建。
 */

const storageKey = "prepare-resume-and-interview:classic-blue-a4";
const originalData = structuredClone(window.__RESUME_DATA__ || {});
const fields = [...document.querySelectorAll("[data-field]")];
const status = document.querySelector(".editor-status");
const dataFileInput = document.querySelector('[data-role="data-file"]');
const photoFileInput = document.querySelector('[data-role="photo-file"]');
const photo = document.querySelector("[data-photo]");

function pathParts(path) {
  return path.split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

function getAtPath(object, path) {
  return pathParts(path).reduce((value, key) => value?.[key], object);
}

function setAtPath(object, path, nextValue) {
  const parts = pathParts(path);
  const lastKey = parts.pop();
  const target = parts.reduce((value, key) => value[key], object);
  target[lastKey] = nextValue;
}

function showStatus(message) {
  status.textContent = message;
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    status.textContent = "";
  }, 2200);
}

function collectData() {
  const data = structuredClone(originalData);
  for (const field of fields) {
    setAtPath(data, field.dataset.field, field.textContent.trim());
  }
  if (photo?.src) {
    data.profile.avatar = photo.src;
  }
  return data;
}

function applyData(data) {
  for (const field of fields) {
    const value = getAtPath(data, field.dataset.field);
    if (value !== undefined && value !== null) {
      field.textContent = String(value);
    }
  }
  if (data.profile?.avatar && photo) {
    photo.src = data.profile.avatar;
  }
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(collectData()));
  showStatus("已保存到当前浏览器");
}

function downloadJson(data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name = String(data.profile?.name || "resume").replace(/[\\/:*?"<>|]/g, "-");
  link.href = url;
  link.download = `${name}-resume.json`;
  link.click();
  URL.revokeObjectURL(url);
}

for (const field of fields) {
  field.addEventListener("paste", (event) => {
    // 只粘贴纯文本，避免把网页样式带入简历。
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
  });
  field.addEventListener("input", saveData);
}

document.querySelector('[data-action="export-data"]').addEventListener("click", () => {
  const data = collectData();
  localStorage.setItem(storageKey, JSON.stringify(data));
  downloadJson(data);
  showStatus("已导出 JSON");
});

document.querySelector('[data-action="import-data"]').addEventListener("click", () => dataFileInput.click());
dataFileInput.addEventListener("change", async () => {
  const [file] = dataFileInput.files;
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    applyData(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
    showStatus("已导入并保存");
  } catch (error) {
    showStatus(`导入失败：${error.message}`);
  } finally {
    dataFileInput.value = "";
  }
});

document.querySelector('[data-action="replace-photo"]').addEventListener("click", () => photoFileInput.click());
photoFileInput.addEventListener("change", () => {
  const [file] = photoFileInput.files;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    photo.src = reader.result;
    saveData();
  });
  reader.readAsDataURL(file);
  photoFileInput.value = "";
});

document.querySelector('[data-action="reset"]').addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  applyData(originalData);
  showStatus("已恢复模板原稿");
});

document.querySelector('[data-action="print"]').addEventListener("click", () => window.print());

try {
  const savedData = JSON.parse(localStorage.getItem(storageKey));
  if (savedData) applyData(savedData);
} catch {
  localStorage.removeItem(storageKey);
}
