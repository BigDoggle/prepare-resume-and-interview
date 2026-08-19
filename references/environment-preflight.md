# 环境预检与安装规范

## 目录

1. 执行时机
2. 能力矩阵
3. 跨平台命令
4. 失败与安装授权
5. 安装后的复检

## 一、执行时机

在以下场景运行环境预检：

- 本 Skill 在当前用户环境中第一次执行；
- 切换电脑、操作系统、容器或远程环境；
- PATH、Python、Node、Git 或浏览器环境发生变化；
- 任务从项目分析或 HTML 制作扩展为 PDF 导出、PDF 复刻；
- 脚本出现“命令不存在”“模块不存在”或浏览器启动失败。

同一环境、同一任务能力已经验证通过时不机械重复。只做文本审查且完全不运行仓库或简历脚本时，可以记录“本轮无需脚本能力”，但后续一旦执行脚本仍须预检。

若当前 Agent 平台提供受管的 Python、Node 或依赖运行时，先读取并验证该运行时；能够稳定执行本 Skill 脚本时可视为环境能力，不要求用户重复安装。使用受管 Node 依赖时，应把平台提供的模块目录通过 `NODE_PATH` 传给预检和后续脚本，并在同一任务中保持一致。

## 二、能力矩阵

| 任务参数 | 必需能力 | 不应提前强制安装 |
|---|---|---|
| `project` | Python 3.9+、Git | Node、浏览器、Playwright |
| `resume` | Python 3.9+、Node.js 18+ | Playwright、PDF 工具 |
| `template` | Python 3.9+、Node.js 18+ | Playwright、PDF 工具 |
| `pdf` | Python 3.9+、Node.js 18+、npm、Playwright、Chrome/Edge/Chromium | 与导出无关的工具 |
| `pdf-rebuild` | `pdf` 的全部能力；必要时再检查 PDF 读取/渲染工具 | 未被实际流程使用的 OCR 工具 |

预检脚本只检查能力，不安装软件，也不写入用户项目。输出中“缺失的必需能力”会导致退出码 `2`；可选项或无法确认的能力以提示形式报告。

## 三、跨平台命令

### macOS / Linux

```bash
sh scripts/preflight.sh --task project
sh scripts/preflight.sh --task resume
sh scripts/preflight.sh --task resume --task project
sh scripts/preflight.sh --task pdf --project-root /absolute/path/to/resume
```

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task project
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task resume
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task resume,project
powershell -ExecutionPolicy Bypass -File scripts\preflight.ps1 -Task pdf -ProjectRoot C:\path\to\resume
```

若执行策略不允许 `.ps1`，可在不改变系统策略的前提下直接运行：

```powershell
py -3 scripts\preflight.py --task resume
```

脚本支持 `--json`（PowerShell 使用 `-Json`），便于 Agent 读取结构化结果。不要在面向 Windows 的指令中使用 `export`、`which`、`chmod` 或反斜杠续行；不要在面向 macOS/Linux 的指令中使用 `$env:`、`Get-Command` 或 PowerShell 续行符。

## 四、失败与安装授权

预检失败后必须停止依赖该能力的步骤，并向用户提供：

1. 当前系统和检测到的版本；
2. 缺少或版本不足的能力；
3. 哪个任务因此无法继续；
4. 建议安装的软件及预计会修改的范围；
5. 明确的确认问题，例如“是否允许我通过已检测到的 Homebrew 安装 Node.js？”

在用户确认前不得执行包管理器安装、在线安装器、管理员命令或 PATH 修改。提出方案时优先检查当前系统已有的包管理器：macOS 常见 Homebrew，Windows 常见 winget、Chocolatey 或 Scoop，Linux 使用发行版对应包管理器。实际安装前应核对当前官方安装说明和包名，不把本文档中的示例当成永远有效的版本号。

用户同意后，只安装本次缺失的必要能力：

- Python：优先官方安装方式或当前系统可信包管理器；
- Node.js：优先当前 LTS，并确保 `node` 与 `npm` 同时可用；
- Git：使用系统开发工具或可信包管理器；
- 浏览器：安装 Chrome、Edge 或 Chromium 之一；
- Playwright：在简历工程目录按 `package.json` 安装依赖，不全局安装。

需要管理员权限、系统级修改或多个安装路径可选时，再次向用户说明并确认，不静默使用 `sudo` 或提升权限。

## 五、安装后的复检

安装完成后：

1. 重新打开终端或刷新 PATH；
2. 使用完全相同的任务参数重新运行预检；
3. 只有退出码为 `0` 时继续任务；
4. 报告实际版本和可用能力；
5. 安装产生的缓存、依赖和浏览器文件不得提交到 Skill 或简历仓库。

若复检仍失败，先根据预检输出定位 PATH、版本或模块问题，不重复安装同一软件。
