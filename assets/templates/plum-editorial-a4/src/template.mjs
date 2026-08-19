/**
 * 根据结构化内容生成梅紫色单页 A4 技术简历。
 * 内容统一来自 content/resume.json，模板只负责语义结构与展示。
 */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sectionHeading(title) {
  return `<header class="section-heading"><h2>${escapeHtml(title)}</h2></header>`;
}

function entryBlock(entry, type) {
  const details = type === "project"
    ? entry.details.map((detail) => `
        <li>
          <strong>${escapeHtml(detail.label)}：</strong>${escapeHtml(detail.text)}
        </li>`).join("")
    : entry.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `
    <article class="resume-entry ${type}-entry">
      <header class="entry-header">
        <div class="entry-title">
          <h3>${escapeHtml(entry.name)}</h3>
          <span>${escapeHtml(entry.role)}</span>
        </div>
        <time>${escapeHtml(entry.period)}</time>
      </header>
      <ul class="bullet-list">${details}</ul>
    </article>`;
}

export function renderResume(data) {
  const { profile, summary, workExperience, projects, education, skills } = data;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(profile.name)}的个人简历" />
  <title>${escapeHtml(profile.name)}｜${escapeHtml(profile.title)}</title>
  <link rel="stylesheet" href="../src/styles.css" />
</head>
<body>
  <main class="resume-document" aria-label="${escapeHtml(profile.name)}的个人简历">
    <article class="resume-page" aria-label="A4 单页简历">
      <header class="profile-header">
        <div class="identity-block">
          <h1>${escapeHtml(profile.name)}</h1>
          <p>${escapeHtml(profile.title)}</p>
        </div>
        <address class="contact-list" aria-label="联系方式">
          <span>${escapeHtml(profile.location)}</span>
          <span>${escapeHtml(profile.phone)}</span>
          <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
          <a href="https://${escapeHtml(profile.github)}">${escapeHtml(profile.github)}</a>
        </address>
      </header>

      <section class="summary-band resume-section" aria-labelledby="summary-title">
        <h2 id="summary-title">个人简介</h2>
        <p>${escapeHtml(summary)}</p>
      </section>

      <section class="resume-section experience-section">
        ${sectionHeading("工作经历")}
        ${workExperience.map((entry) => entryBlock(entry, "work")).join("")}
      </section>

      <section class="resume-section project-section">
        ${sectionHeading("项目经历")}
        ${projects.map((entry) => entryBlock(entry, "project")).join("")}
      </section>

      <section class="footer-grid" aria-label="教育背景与专业技能">
        <section class="info-card education-card">
          <h2>教育背景</h2>
          ${education.map((item) => `
            <article class="education-item">
              <header><h3>${escapeHtml(item.school)}</h3><time>${escapeHtml(item.period)}</time></header>
              <p>${escapeHtml(item.degree)}</p>
              ${item.extra ? `<p>${escapeHtml(item.extra)}</p>` : ""}
            </article>`).join("")}
        </section>
        <section class="info-card skills-card">
          <h2>专业技能</h2>
          <dl>
            ${skills.map((item) => `
              <div><dt>${escapeHtml(item.label)}：</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("")}
          </dl>
        </section>
      </section>
    </article>
  </main>
</body>
</html>`;
}
