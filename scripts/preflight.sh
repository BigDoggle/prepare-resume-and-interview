#!/bin/sh
# macOS/Linux 启动器：先寻找 Python，再交给跨平台预检脚本。

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if command -v python3 >/dev/null 2>&1; then
  exec python3 "$SCRIPT_DIR/preflight.py" "$@"
fi

if command -v python >/dev/null 2>&1 \
  && python -c 'import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)' >/dev/null 2>&1; then
  exec python "$SCRIPT_DIR/preflight.py" "$@"
fi

echo "环境预检失败：未找到 Python 3。请先安装 Python 3.9 或更高版本；如需由 Agent 协助安装，请明确确认后再继续。" >&2
exit 2
