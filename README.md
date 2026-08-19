<div align="center">

# Prepare Resume & Interview

**写简历、挖经历、换模板、备面试，一个 Skill 全部搞定。**

[English](README_EN.md) · **简体中文**

![HTML/CSS](https://img.shields.io/badge/Resume-HTML%2FCSS-315f95?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776ab?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Agent Skill](https://img.shields.io/badge/AI_Agent-Skill-111827?style=flat-square)

</div>

你是否还在为了写简历而苦恼？

项目做了不少，落到简历上却只剩一句“负责功能开发”？实习期间解决过很多问题，回头总结时却想不起重点？好不容易找到喜欢的 PDF 模板，改一行字，整页格式就乱了？

那就用这个 Skill 吧。

把旧简历、项目代码、Git 记录或喜欢的模板交给它。它会帮你提炼实习和项目经历，生成 HTML 简历，准备面试材料；确认版式后，还能继续导出 PDF。一次整理，多处复用，不必每次求职都从空白文档重新开始。

## 一眼看懂它能做什么

| 你想做的事 | 它会怎么帮你 |
|---|---|
| 快速生成一份简历 | 读取旧简历和个人资料，选择内置模板，生成结构清晰的 HTML 简历 |
| 总结实习与项目经历 | 分析源码、Git、测试和项目文档，把零散工作整理成职责、难点、技术动作和结果 |
| 使用喜欢的简历样式 | 解析 PDF、DOCX 或现有 HTML/CSS，重建成可维护的模板，不把整页截图当成简历 |
| 准备项目面试 | 复用同一份项目事实，生成项目介绍、STAR 故事、设计取舍和连续追问 |

## 生成效果

下面两页由内置的 `classic-blue-a4` 模板真实构建，并从浏览器逐页截取。人物、学校、公司和联系方式均为虚构数据；头像由 AI 生成，仅用于演示。

<p align="center">
  <img src="docs/images/resume-page-1.png" width="49%" alt="中文技术简历示例第 1 页" />
  <img src="docs/images/resume-page-2.png" width="49%" alt="中文技术简历示例第 2 页" />
</p>

## 为什么用它

这个 Skill 最重要的能力不是替你润色几句话，而是先把经历理清楚。旧简历里有经历，代码里有实现，Git 里有过程，测试里有边界。它会把这些材料拼回完整项目，分清“团队做了什么”和“你做了什么”，再决定哪些内容值得进入简历。

写出来的内容也要经得起追问。修过一个并发问题，不会被夸成“主导交易架构”；但其中真正有价值的状态控制、事务校验和测试闭环，会被完整提炼出来。简历要点、项目介绍和面试问题共用同一份事实底稿，所以简历上的每个亮点都能继续讲到设计选择、异常路径和验证方式。

最终先交付 HTML，方便检查内容、照片、分页和间距。确认后回复“导出 PDF”即可；如果还想逐页检查裁切、字体和边距，可以继续要求“视觉验收”。

## 三步开始

### 1. 准备手头已有的材料

不用凑齐所有资料。下面任意一种都可以开始：

- 旧简历、个人经历或目标岗位；
- 项目源码、Git 仓库、设计文档或测试记录；
- 喜欢的 PDF、DOCX、HTML/CSS 简历模板。

缺少数据时，Skill 会先生成保守版本，再集中列出需要你确认的内容，不会为了填满页面编造数字。

### 2. 直接说你想要什么

制作简历：

```text
请使用 prepare-resume-and-interview，根据我的旧简历和项目资料，
为 Java 后端岗位制作一份两页中文简历。先展示 HTML，不要导出 PDF。
```

复刻模板：

```text
请使用 prepare-resume-and-interview，参考我上传的 PDF，
重建一个视觉接近的 HTML/CSS 模板，先用脱敏数据验证版式。
```

整理项目：

```text
请使用 prepare-resume-and-interview，分析这个项目的源码和 Git 历史，
总结我的实习与项目经历，并生成项目介绍、STAR 故事和面试追问。
```

### 3. 查看 HTML，需要时导出 PDF

HTML 是默认交付。确认内容与版式后，再要求导出 PDF。普通导出只生成文件；需要检查最终效果时，请明确提出视觉验收。

## 它怎么避免把经历写“飘”

所有材料会先进入事实底稿：源码、Git、配置、测试和本人确认属于事实；根据多项事实得到的解释会保留依据；未来方案不会写成已经实现；职责、规模和收益不确定时会等待确认。

这套规则直接影响简历措辞。只有证据足够时才使用“主导”或“独立负责”；证据更适合支持“实现”“完善”或“参与”时，就按真实边界表达。

## 安装

这个 Skill 不绑定特定 Agent。只要客户端支持加载技能目录或读取 `SKILL.md`，就可以使用。具体安装目录由你使用的客户端决定。

```bash
git clone https://github.com/BigDoggle/prepare-resume-and-interview.git
```

克隆后，将仓库放入客户端的技能目录；也可以让 Agent 直接读取仓库中的 `SKILL.md`。

HTML 简历制作需要 Python 3.9+ 和 Node.js 18+。在项目目录运行：

```bash
sh scripts/preflight.sh --task resume
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task resume
```

只有 PDF 导出或 PDF 复刻任务才检查 npm、Playwright 和 Chrome、Edge 或 Chromium。预检脚本只报告环境，不会自行安装软件或修改 PATH。

<details>
<summary><strong>模板命令与工程结构</strong></summary>

查看、校验和复制模板：

```bash
python3 scripts/template_manager.py --templates-root assets/templates list
python3 scripts/template_manager.py --templates-root assets/templates validate

python3 scripts/template_manager.py \
  --templates-root assets/templates \
  clone --id classic-blue-a4 \
  --destination /absolute/path/to/my-resume
```

构建 HTML，并在明确要求后导出 PDF：

```bash
cd /absolute/path/to/my-resume
npm run build
npm run pdf
```

简历工程：

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

仓库结构：

```text
prepare-resume-and-interview/
├── SKILL.md                # 任务路由、事实边界和交付规则
├── agents/openai.yaml      # 可选的 Agent 界面元数据
├── assets/templates/       # 脱敏公共模板
├── references/             # 项目、简历、模板和 PDF 流程规范
├── scripts/                # 环境预检与模板管理工具
└── docs/images/            # README 演示图片
```

</details>

## 隐私与操作边界

- 公共模板不保存真实手机号、邮箱、照片、内网地址或客户数据。
- 个人简历工程默认放在 Skill 仓库之外。
- PDF 导出需要明确指令，视觉验收不会随普通导出自动执行。
- Skill 不会自行提交或推送代码。
