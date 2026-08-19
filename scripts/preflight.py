#!/usr/bin/env python3
"""按任务检查 Skill 的跨平台运行环境，不执行任何安装或系统修改。"""

from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


任务能力 = {
    "project": {"python", "git"},
    "resume": {"python", "node"},
    "template": {"python", "node"},
    "pdf": {"python", "node", "npm", "playwright", "browser"},
    "pdf-rebuild": {"python", "node", "npm", "playwright", "browser"},
    "all": {"python", "git", "node", "npm", "playwright", "browser"},
}


def 运行版本命令(命令: list[str]) -> str | None:
    """返回命令首行；命令不可用或执行失败时返回 None。"""
    try:
        结果 = subprocess.run(
            命令,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if 结果.returncode != 0:
        return None
    文本 = (结果.stdout or 结果.stderr).strip()
    return 文本.splitlines()[0] if 文本 else "可用"


def 检查命令(名称: str, 版本参数: str = "--version") -> dict[str, Any]:
    路径 = shutil.which(名称)
    if not 路径:
        return {"available": False, "path": None, "version": None}
    return {
        "available": True,
        "path": 路径,
        "version": 运行版本命令([路径, 版本参数]),
    }


def 检查_python() -> dict[str, Any]:
    当前版本 = platform.python_version()
    满足版本 = sys.version_info >= (3, 9)
    return {
        "available": 满足版本,
        "path": sys.executable,
        "version": 当前版本,
        "detail": None if 满足版本 else "需要 Python 3.9 或更高版本",
    }


def 提取主版本(版本文本: str | None) -> int | None:
    if not 版本文本:
        return None
    for 片段 in 版本文本.replace("v", "").split("."):
        if 片段.isdigit():
            return int(片段)
    return None


def 检查_node() -> dict[str, Any]:
    结果 = 检查命令("node")
    主版本 = 提取主版本(结果.get("version"))
    if 结果["available"] and (主版本 is None or 主版本 < 18):
        结果["available"] = False
        结果["detail"] = "需要 Node.js 18 或更高版本"
    return 结果


def 检查_playwright(工程目录: Path) -> dict[str, Any]:
    node = shutil.which("node")
    if not node:
        return {"available": False, "path": None, "version": None}
    try:
        结果 = subprocess.run(
            [node, "-e", "console.log(require.resolve('playwright'))"],
            cwd=工程目录,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return {"available": False, "path": None, "version": None}
    if 结果.returncode != 0:
        return {
            "available": False,
            "path": None,
            "version": None,
            "detail": "当前工程未安装 Playwright；获得用户确认后可在工程目录执行依赖安装",
        }
    return {
        "available": True,
        "path": 结果.stdout.strip(),
        "version": "已安装",
    }


def 浏览器候选路径() -> list[Path]:
    系统 = platform.system()
    候选: list[Path] = []
    if 系统 == "Darwin":
        候选.extend(
            [
                Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
                Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
                Path("/Applications/Chromium.app/Contents/MacOS/Chromium"),
            ]
        )
    elif 系统 == "Windows":
        根目录 = [
            os.environ.get("PROGRAMFILES"),
            os.environ.get("PROGRAMFILES(X86)"),
            os.environ.get("LOCALAPPDATA"),
        ]
        for 根 in filter(None, 根目录):
            候选.extend(
                [
                    Path(根) / "Google/Chrome/Application/chrome.exe",
                    Path(根) / "Microsoft/Edge/Application/msedge.exe",
                    Path(根) / "Chromium/Application/chrome.exe",
                ]
            )
    return 候选


def 检查_browser() -> dict[str, Any]:
    显式路径 = os.environ.get("RESUME_CHROME_PATH")
    if 显式路径 and Path(显式路径).is_file():
        return {"available": True, "path": 显式路径, "version": "显式配置"}
    for 路径 in 浏览器候选路径():
        if 路径.is_file():
            return {"available": True, "path": str(路径), "version": "系统浏览器"}
    for 命令 in (
        "google-chrome",
        "google-chrome-stable",
        "microsoft-edge",
        "chromium",
        "chromium-browser",
    ):
        路径 = shutil.which(命令)
        if 路径:
            return {"available": True, "path": 路径, "version": 运行版本命令([路径, "--version"])}
    return {
        "available": False,
        "path": None,
        "version": None,
        "detail": "未找到 Chrome、Edge 或 Chromium，也未配置 RESUME_CHROME_PATH",
    }


def 创建解析器() -> argparse.ArgumentParser:
    解析器 = argparse.ArgumentParser(description="检查简历与面试 Skill 的运行环境")
    解析器.add_argument(
        "--task",
        action="append",
        choices=tuple(任务能力),
        default=[],
        help="要执行的任务，可重复传入；默认 resume",
    )
    解析器.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="简历工程目录，用于检查本地 Playwright 依赖",
    )
    解析器.add_argument("--json", action="store_true", help="输出 JSON 结果")
    return 解析器


def main() -> int:
    参数 = 创建解析器().parse_args()
    任务列表 = 参数.task or ["resume"]
    必需能力 = set().union(*(任务能力[任务] for 任务 in 任务列表))
    工程目录 = 参数.project_root.expanduser().resolve()

    检查结果 = {
        "python": 检查_python(),
        "git": 检查命令("git"),
        "node": 检查_node(),
        "npm": 检查命令("npm"),
        "playwright": 检查_playwright(工程目录),
        "browser": 检查_browser(),
    }
    缺失 = sorted(能力 for 能力 in 必需能力 if not 检查结果[能力]["available"])
    输出 = {
        "os": {"system": platform.system(), "release": platform.release(), "machine": platform.machine()},
        "tasks": 任务列表,
        "projectRoot": str(工程目录),
        "required": sorted(必需能力),
        "checks": 检查结果,
        "missingRequired": 缺失,
        "ok": not 缺失,
    }

    if 参数.json:
        print(json.dumps(输出, ensure_ascii=False, indent=2))
    else:
        print(f"操作系统：{输出['os']['system']} {输出['os']['release']} ({输出['os']['machine']})")
        print(f"任务：{', '.join(任务列表)}")
        for 能力 in sorted(必需能力):
            结果 = 检查结果[能力]
            状态 = "通过" if 结果["available"] else "缺失/不满足"
            详情 = 结果.get("version") or 结果.get("detail") or "未检测到"
            print(f"[{状态}] {能力}：{详情}")
        if 缺失:
            print(f"预检未通过，缺少必需能力：{', '.join(缺失)}", file=sys.stderr)
            print("已停止。请先征得用户同意，再按当前系统安装缺失能力。", file=sys.stderr)
        else:
            print("环境预检通过，可以继续当前任务。")
    return 0 if not 缺失 else 2


if __name__ == "__main__":
    raise SystemExit(main())
