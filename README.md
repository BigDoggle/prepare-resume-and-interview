<div align="center">

# Prepare Resume & Interview

**从代码和项目证据出发，写出经得起追问的简历。**

[English](README_EN.md) · **简体中文**

![HTML/CSS](https://img.shields.io/badge/Resume-HTML%2FCSS-315f95?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776ab?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)

</div>

项目经历往往散落在源码、提交记录、测试、设计文档和旧简历里。真正难的不是把句子写漂亮，而是确认哪些工作属于本人、哪些结果有证据、简历上的亮点能否在面试中继续展开。

`prepare-resume-and-interview` 是一个 Codex Skill。它先整理项目事实和职责边界，再生成简历与面试资料。没有证据的规模、收益、上线状态和个人贡献不会被补写进成稿。

## 生成效果

下面两页由仓库内置的 `classic-blue-a4` 模板真实构建，再从浏览器页面逐页截取。人物、学校、公司和联系方式均为虚构数据；头像由 AI 生成，仅用于演示。

<p align="center">
  <img src="docs/images/resume-page-1.png" width="49%" alt="中文技术简历示例第 1 页" />
  <img src="docs/images/resume-page-2.png" width="49%" alt="中文技术简历示例第 2 页" />
</p>

## 它具体解决什么问题

| 常见问题 | 本项目的处理方式 |
|---|---|
| 不确定某项成果能不能写成“本人负责” | 先核对 Git 作者、分支、时间范围、身份别名以及用户确认，再选择“主导、负责、完善、参与”等职责动词 |
| 提交记录全是修复和小改动，难以形成项目亮点 | 把零散变更还原为状态机、事务一致性、异常补偿、测试闭环等完整机制，同时保留证据来源 |
| 简历写得很好，面试时却讲不深 | 同一份事实底稿同时生成项目介绍、STAR 故事和连续追问，避免简历与面试资料各写一套 |
| 找到喜欢的 PDF 模板，但只能改截图 | 解析页面尺寸、字体、间距、照片边界和分页结构，重建为可搜索、可维护的 HTML/CSS 模板 |
| 内容一增加，第二页字号和边距就开始失控 | 模板使用统一的 A4 变量；空间不足时移动完整项目或经历，不单独压缩某一页 |
| 只想先看效果，却自动生成了一堆文件 | 默认只构建 HTML；收到明确的“导出 PDF”指令后才执行导出 |

## 三种使用方式

### 1. 使用内置模板制作简历

上传旧简历、项目资料或提供代码仓库，说明目标岗位。Skill 会选择匹配模板，建立结构化内容源，并生成纯净的 HTML 简历页面。

```text
使用 $prepare-resume-and-interview，根据我的旧简历和项目仓库，
为 Java 后端岗位制作一份两页中文简历。先展示 HTML，不要导出 PDF。
```

### 2. 把喜欢的简历重建成模板

可以上传 PDF、DOCX 或已有 HTML/CSS。PDF 是视觉权威；DOCX 可辅助恢复文本和图片。最终模板不是整页截图，正文仍可搜索，内容、结构和样式也会分开保存。

```text
使用 $prepare-resume-and-interview，参考我上传的 PDF 简历，
重建一个视觉接近的 HTML/CSS 模板，先用脱敏数据验证版式。
```

### 3. 从项目生成面试资料

当输入包含源码和 Git 历史时，Skill 可以还原业务链路、个人贡献、设计取舍与失败边界，再产出简历要点和面试追问。

```text
使用 $prepare-resume-and-interview，分析这个项目的源码和 Git 历史，
整理我的个人贡献、项目介绍、STAR 故事和连续追问。
```

HTML 是默认交付。确认内容与版式后，再回复“导出 PDF”即可。普通导出只检查命令成功和文件存在；需要逐页查看裁切、字体或分页时，请明确要求“视觉验收”。

## 事实底稿

Skill 不直接把原始资料改写成简历，而是先区分四类信息：

| 标记 | 含义 | 能否直接进入简历 |
|---|---|---|
| `F` | 源码、Git、配置、测试、正式资料或本人确认的事实 | 可以 |
| `R` | 由多项事实推导的解释，并保留推导依据 | 经确认后可以 |
| `P` | 可讨论的改进或演进方案 | 不可以写成已实现 |
| `U` | 职责、数据、上线状态或效果仍待确认 | 不可以 |

这个区分会直接影响措辞。例如，修复过并发提交问题不等于独立设计整套交易系统；没有方案与核心实现证据时，也不会使用“主导”。

## 快速开始

### 安装

```bash
git clone https://github.com/BigDoggle/prepare-resume-and-interview.git \
  ~/.codex/skills/prepare-resume-and-interview
```

### 环境预检

macOS / Linux：

```bash
cd ~/.codex/skills/prepare-resume-and-interview
sh scripts/preflight.sh --task resume
```

Windows PowerShell：

```powershell
cd $HOME\.codex\skills\prepare-resume-and-interview
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task resume
```

制作 HTML 简历需要 Python 3.9+ 和 Node.js 18+。只有 PDF 导出或 PDF 复刻任务才检查 npm、Playwright 和 Chrome、Edge 或 Chromium。预检脚本只检查能力，不会自行安装软件或修改 PATH。

## 模板命令

```bash
# 查看和校验内置模板
python3 scripts/template_manager.py --templates-root assets/templates list
python3 scripts/template_manager.py --templates-root assets/templates validate

# 复制模板到个人工作目录
python3 scripts/template_manager.py \
  --templates-root assets/templates \
  clone --id classic-blue-a4 \
  --destination /absolute/path/to/my-resume

# 构建 HTML
cd /absolute/path/to/my-resume
npm run build

# 用户明确要求后导出 PDF
npm run pdf
```

真实姓名、联系方式和照片只写入复制后的工作目录，不回写公共模板。

## 简历工程

```text
resume/
├── assets/                 # 照片、图标与本地资源
├── content/resume.json     # 唯一内容事实源
├── src/template.mjs        # 语义 HTML 结构
├── src/styles.css          # 屏幕与打印样式
├── scripts/build.mjs       # HTML 构建
├── scripts/export-pdf.cjs  # PDF 导出
├── dist/index.html         # 构建结果
└── output/pdf/             # 明确要求后生成的 PDF
```

`content` 保存事实，`src` 负责表现，`dist` 是可覆盖的生成物。修改内容后重新构建即可，不需要维护多份正文。

## 仓库内容

```text
prepare-resume-and-interview/
├── SKILL.md                # 任务路由、事实边界和交付规则
├── agents/openai.yaml      # Codex 展示信息与默认提示
├── assets/templates/       # 脱敏公共模板
├── references/             # 项目、简历、模板和 PDF 流程规范
├── scripts/                # 环境预检与模板管理工具
└── docs/images/            # README 演示图片
```

## 隐私与操作边界

- 公共模板不保存真实手机号、邮箱、照片、内网地址或客户数据。
- 个人简历工程默认放在 Skill 仓库之外。
- PDF 导出需要明确指令；视觉验收不会随普通导出自动执行。
- Skill 不会自行提交或推送代码。

## README 参考

文档结构参考了 [Reactive Resume](https://github.com/amruthpillai/reactive-resume)、[JSON Resume](https://github.com/jsonresume/resume-cli) 和 [Awesome README](https://github.com/matiassingers/awesome-readme)。本项目只借鉴信息组织方式，流程、模板与代码由本仓库独立维护。
