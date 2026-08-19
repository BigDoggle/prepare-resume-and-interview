/**
 * 根据结构化内容生成固定 A4 双页简历。
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

function section(title) {
  return `<header class="section-heading"><h2>${escapeHtml(title)}</h2></header>`;
}

function bulletList(items, className = "plain-list") {
  return `<ul class="${className}">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function numberedList(items) {
  return `<ol class="numbered-list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ol>`;
}

function projectBlock(project) {
  return `
    <article class="project-block">
      <h3 class="dot-title">${escapeHtml(project.title)}</h3>
      <p class="labeled-line"><strong>项目介绍：</strong>${escapeHtml(project.summary)}</p>
      <p class="list-label">主要工作：</p>
      ${numberedList(project.bullets)}
    </article>`;
}

export function renderResume(data) {
  const { profile, education, courses, skills, internship, projects, honors, selfEvaluation } = data;
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
  <main class="resume-document" aria-label="${escapeHtml(profile.name)}的个人简历">
    <article class="resume-page page-one" aria-label="简历第 1 页">
      <header class="profile-header">
        <div class="profile-main">
          <h1>${escapeHtml(profile.name)}</h1>
          <dl class="contact-grid">
            <div><dt>电话：</dt><dd>${escapeHtml(profile.phone)}</dd></div>
            <div><dt>邮箱：</dt><dd>${escapeHtml(profile.email)}</dd></div>
            <div><dt>籍贯：</dt><dd>${escapeHtml(profile.origin)}</dd></div>
            <div><dt>出生年月：</dt><dd>${escapeHtml(profile.birth)}</dd></div>
          </dl>
        </div>
        <img class="avatar" data-photo src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}的证件照" width="260" height="378" />
      </header>

      <section class="resume-section education-section">
        ${section("教育背景")}
        <div class="education-list">
          ${education.map((item, index) => `
            <div class="education-row">
              <time>${escapeHtml(item.period)}</time>
              <strong>${escapeHtml(item.school)}</strong>
              <strong>${escapeHtml(item.major)}</strong>
            </div>`).join("")}
        </div>
        <p class="course-line"><strong>主修课程：</strong>${escapeHtml(courses)}</p>
      </section>

      <section class="resume-section skills-section">
        ${section("专业技能")}
        ${bulletList(skills, "skill-list")}
      </section>

      <section class="resume-section internship-section">
        ${section("实习经历")}
        <article class="internship-block">
          <h3 class="dot-title">${escapeHtml(internship.title)}</h3>
          <p class="labeled-line"><strong>实习时间：</strong>${escapeHtml(internship.period)}</p>
          <p class="labeled-line"><strong>业务介绍：</strong>${escapeHtml(internship.summary)}</p>
          <p class="list-label">主要工作：</p>
          ${numberedList(internship.bullets)}
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
        ${bulletList(honors, "honor-list")}
      </section>

      <section class="resume-section evaluation-section">
        ${section("自我评价")}
        ${bulletList(selfEvaluation, "evaluation-list")}
      </section>
    </article>
  </main>
</body>
</html>`;
}
