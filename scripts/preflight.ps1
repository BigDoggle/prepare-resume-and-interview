param(
    [ValidateSet("project", "resume", "template", "pdf", "pdf-rebuild", "all")]
    [string[]]$Task = @("resume"),
    [string]$ProjectRoot = ".",
    [switch]$Json
)

# Windows 启动器：优先使用 py 启动器，其次使用 PATH 中的 python。
$ScriptPath = Join-Path $PSScriptRoot "preflight.py"
$Arguments = @($ScriptPath, "--project-root", $ProjectRoot)
foreach ($Item in $Task) {
    $Arguments += @("--task", $Item)
}
if ($Json) {
    $Arguments += "--json"
}

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 @Arguments
    exit $LASTEXITCODE
}

if (Get-Command python -ErrorAction SilentlyContinue) {
    & python @Arguments
    exit $LASTEXITCODE
}

Write-Error "环境预检失败：未找到 Python 3。请先安装 Python 3.9 或更高版本；如需由 Agent 协助安装，请明确确认后再继续。"
exit 2
