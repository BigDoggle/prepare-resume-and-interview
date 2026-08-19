/**
 * 生成固定 A4 双页简历，并为主要内容标记稳定的在线编辑字段。
 * 模板坚持正常文档流，避免使用手工制表位和正文绝对定位。
 */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function editableAttributes(path) {
  return `contenteditable="true" spellcheck="false" data-field="${escapeHtml(path)}"`;
}

function editableText(value, path) {
  return `<span ${editableAttributes(path)}>${escapeHtml(value)}</span>`;
}

function section(title) {
  return `<header class="section-heading"><h2>${escapeHtml(title)}</h2></header>`;
}

function bulletList(items, fieldPrefix, className = "plain-list") {
  return `<ul class="${className}">${items
    .map((item, index) => `<li ${editableAttributes(`${fieldPrefix}.${index}`)}>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function numberedList(items, fieldPrefix) {
  return `<ol class="numbered-list">${items
    .map((item, index) => `<li ${editableAttributes(`${fieldPrefix}.${index}`)}>${escapeHtml(item)}</li>`)
    .join("")}</ol>`;
}

function projectBlock(project, projectIndex) {
  const prefix = `projects.${projectIndex}`;
  return `
    <article class="project-block">
      <h3 class="dot-title" ${editableAttributes(`${prefix}.title`)}>${escapeHtml(project.title)}</h3>
      <p class="labeled-line"><strong>项目介绍：</strong>${editableText(project.summary, `${prefix}.summary`)}</p>
      <p class="list-label">主要工作：</p>
      ${numberedList(project.bullets, `${prefix}.bullets`)}
    </article>`;
}

export function renderResume(data) {
  const { profile, education, courses, skills, internship, projects, honors, selfEvaluation } = data;
  // 转义小于号，避免内容中的 HTML 片段提前结束脚本元素。
  const serializedData = JSON.stringify(data).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(profile.name)}的个人简历" />
  <title>${escapeHtml(profile.name)}｜个人简历</title>
  <link rel="stylesheet" href="../src/styles.css" />
</head>
<body>
  <aside class="editor-toolbar" aria-label="简历编辑工具">
    <strong>在线编辑</strong>
    <button type="button" data-action="export-data">导出数据</button>
    <button type="button" data-action="import-data">导入数据</button>
    <button type="button" data-action="replace-photo">替换照片</button>
    <button type="button" data-action="reset">恢复原稿</button>
    <button type="button" data-action="print">打印 / PDF</button>
    <input type="file" data-role="data-file" accept="application/json,.json" hidden />
    <input type="file" data-role="photo-file" accept="image/*" hidden />
    <span class="editor-status" role="status" aria-live="polite"></span>
  </aside>

  <main class="resume-document" aria-label="${escapeHtml(profile.name)}的个人简历">
    <article class="resume-page page-one" aria-label="简历第 1 页">
      <header class="profile-header">
        <div class="profile-main">
          <h1 ${editableAttributes("profile.name")}>${escapeHtml(profile.name)}</h1>
          <dl class="contact-grid">
            <div><dt>电话：</dt><dd ${editableAttributes("profile.phone")}>${escapeHtml(profile.phone)}</dd></div>
            <div><dt>邮箱：</dt><dd ${editableAttributes("profile.email")}>${escapeHtml(profile.email)}</dd></div>
            <div><dt>籍贯：</dt><dd ${editableAttributes("profile.origin")}>${escapeHtml(profile.origin)}</dd></div>
            <div><dt>出生年月：</dt><dd ${editableAttributes("profile.birth")}>${escapeHtml(profile.birth)}</dd></div>
          </dl>
        </div>
        <img class="avatar" data-photo src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}的证件照" width="260" height="378" />
      </header>

      <section class="resume-section education-section">
        ${section("教育背景")}
        <div class="education-list">
          ${education.map((item, index) => `
            <div class="education-row">
              <time ${editableAttributes(`education.${index}.period`)}>${escapeHtml(item.period)}</time>
              <strong ${editableAttributes(`education.${index}.school`)}>${escapeHtml(item.school)}</strong>
              <strong ${editableAttributes(`education.${index}.major`)}>${escapeHtml(item.major)}</strong>
            </div>`).join("")}
        </div>
        <p class="course-line"><strong>主修课程：</strong>${editableText(courses, "courses")}</p>
      </section>

      <section class="resume-section skills-section">
        ${section("专业技能")}
        ${bulletList(skills, "skills", "skill-list")}
      </section>

      <section class="resume-section internship-section">
        ${section("实习经历")}
        <article class="internship-block">
          <h3 class="dot-title" ${editableAttributes("internship.title")}>${escapeHtml(internship.title)}</h3>
          <p class="labeled-line"><strong>实习时间：</strong>${editableText(internship.period, "internship.period")}</p>
          <p class="labeled-line"><strong>业务介绍：</strong>${editableText(internship.summary, "internship.summary")}</p>
          <p class="list-label">主要工作：</p>
          ${numberedList(internship.bullets, "internship.bullets")}
        </article>
      </section>
    </article>

    <article class="resume-page page-two" aria-label="简历第 2 页">
      <section class="resume-section projects-section">
        ${section("项目经历")}
        ${projects.map(projectBlock).join("")}
      </section>

      <section class="resume-section honors-section">
        ${section("在校荣誉")}
        ${bulletList(honors, "honors", "honor-list")}
      </section>

      <section class="resume-section evaluation-section">
        ${section("自我评价")}
        ${bulletList(selfEvaluation, "selfEvaluation", "evaluation-list")}
      </section>
    </article>
  </main>
  <script>window.__RESUME_DATA__ = ${serializedData};</script>
  <script src="../src/editor.js"></script>
</body>
</html>`;
}
