#!/usr/bin/env python3
"""管理简历模板注册表，并安全地注册或复制模板工程。"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path
from typing import Any


模板编号规则 = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
忽略名称 = (
    ".git",
    ".DS_Store",
    "node_modules",
    "dist",
    "output",
    "tmp",
    "__pycache__",
    "*.pyc",
    "*.zip",
    "*.pdf",
)


def 读取注册表(模板根目录: Path) -> dict[str, Any]:
    注册表路径 = 模板根目录 / "registry.json"
    if not 注册表路径.exists():
        # 外部模板库用于保存用户自己的私有模板，因此默认允许 private。
        # Skill 内置模板库会在 registry.json 中显式关闭该能力。
        return {"schemaVersion": 1, "allowPrivate": True, "templates": []}
    try:
        数据 = json.loads(注册表路径.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as 异常:
        raise ValueError(f"无法读取模板注册表：{异常}") from 异常
    if not isinstance(数据, dict) or not isinstance(数据.get("templates"), list):
        raise ValueError("模板注册表格式错误：缺少 templates 数组")
    return 数据


def 写入_json(路径: Path, 数据: dict[str, Any]) -> None:
    """先写临时文件再替换，避免中途失败留下半份 JSON。"""
    路径.parent.mkdir(parents=True, exist_ok=True)
    临时路径 = 路径.with_suffix(路径.suffix + ".tmp")
    临时路径.write_text(
        json.dumps(数据, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    临时路径.replace(路径)


def 校验模板编号(模板编号: str) -> None:
    if not 模板编号规则.fullmatch(模板编号):
        raise ValueError("模板 ID 只能使用小写字母、数字和连字符，且不能包含路径符号")


def 安全模板路径(模板根目录: Path, 模板编号: str) -> Path:
    校验模板编号(模板编号)
    根目录 = 模板根目录.resolve()
    目标 = (根目录 / 模板编号).resolve()
    if 目标.parent != 根目录:
        raise ValueError("模板目标路径越出模板根目录")
    return 目标


def 推断工程文件(源目录: Path) -> dict[str, str]:
    候选 = {
        "entry": ["src/template.mjs", "src/template.js", "index.html"],
        "style": ["src/styles.css", "styles.css"],
        "content": ["content/resume.json", "resume.json"],
    }
    结果: dict[str, str] = {}
    for 字段, 路径列表 in 候选.items():
        for 相对路径 in 路径列表:
            if (源目录 / 相对路径).is_file():
                结果[字段] = 相对路径
                break
    return 结果


def 生成索引项(元数据: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": 元数据["id"],
        "name": 元数据["name"],
        "version": 元数据["version"],
        "visibility": 元数据["visibility"],
        "sourceType": 元数据["sourceType"],
        "description": 元数据["description"],
        "features": 元数据.get("features", []),
        "updatedAt": 元数据["updatedAt"],
    }


def 命令_列出(参数: argparse.Namespace) -> int:
    注册表 = 读取注册表(参数.templates_root)
    模板列表 = 注册表["templates"]
    if 参数.json:
        print(json.dumps(模板列表, ensure_ascii=False, indent=2))
        return 0
    if not 模板列表:
        print("尚未注册模板。")
        return 0
    for 模板 in sorted(模板列表, key=lambda 项: 项["id"]):
        print(
            f"{模板['id']}\t{模板.get('version', '-')}\t"
            f"{模板.get('visibility', '-')}\t{模板.get('name', '-') }"
        )
    return 0


def 命令_注册(参数: argparse.Namespace) -> int:
    源目录 = 参数.source.expanduser().resolve()
    if not 源目录.is_dir():
        raise ValueError(f"模板源目录不存在：{源目录}")

    模板根目录 = 参数.templates_root.expanduser().resolve()
    模板根目录.mkdir(parents=True, exist_ok=True)
    注册表 = 读取注册表(模板根目录)
    if 参数.visibility == "private" and not 注册表.get("allowPrivate", True):
        raise ValueError(
            "该模板库只允许脱敏的 public 模板；"
            "请先脱敏，或通过 --templates-root 指定 Skill 仓库之外的私有模板目录"
        )

    目标目录 = 安全模板路径(模板根目录, 参数.id)
    if 源目录 == 目标目录:
        raise ValueError("模板源目录不能与注册目标目录相同，请先在工作副本中修改")

    if 目标目录.exists():
        if not 参数.replace:
            raise ValueError(f"模板已存在：{参数.id}；明确替换时使用 --replace")
        shutil.rmtree(目标目录)

    shutil.copytree(源目录, 目标目录, ignore=shutil.ignore_patterns(*忽略名称))

    今天 = date.today().isoformat()
    原元数据路径 = 源目录 / "template.json"
    原元数据: dict[str, Any] = {}
    if 原元数据路径.is_file():
        try:
            原元数据 = json.loads(原元数据路径.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            原元数据 = {}

    元数据: dict[str, Any] = {
        **原元数据,
        "id": 参数.id,
        "name": 参数.name,
        "version": 参数.version,
        "visibility": 参数.visibility,
        "sourceType": 参数.source_type,
        "description": 参数.description,
        "features": 参数.feature or ["a4", "pdf-export", "structured-content"],
        "createdAt": 原元数据.get("createdAt", 今天),
        "updatedAt": 今天,
        **推断工程文件(目标目录),
    }
    写入_json(目标目录 / "template.json", 元数据)

    注册表["templates"] = [
        项 for 项 in 注册表["templates"] if 项.get("id") != 参数.id
    ]
    注册表["templates"].append(生成索引项(元数据))
    注册表["templates"].sort(key=lambda 项: 项["id"])
    写入_json(模板根目录 / "registry.json", 注册表)
    print(f"已注册模板：{参数.id} -> {目标目录}")
    return 0


def 命令_复制(参数: argparse.Namespace) -> int:
    模板根目录 = 参数.templates_root.expanduser().resolve()
    源目录 = 安全模板路径(模板根目录, 参数.id)
    if not 源目录.is_dir():
        raise ValueError(f"模板不存在：{参数.id}")

    目标目录 = 参数.destination.expanduser().resolve()
    if 目标目录.exists():
        raise ValueError(f"目标目录已存在，为避免覆盖已停止：{目标目录}")
    if 源目录 == 目标目录 or 源目录 in 目标目录.parents:
        raise ValueError("复制目标不能位于模板源目录内部")
    目标目录.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(源目录, 目标目录)
    print(f"已复制模板：{参数.id} -> {目标目录}")
    return 0


def 命令_校验(参数: argparse.Namespace) -> int:
    模板根目录 = 参数.templates_root.expanduser().resolve()
    注册表 = 读取注册表(模板根目录)
    允许私有模板 = 注册表.get("allowPrivate", True)
    错误: list[str] = []
    已见编号: set[str] = set()
    必需字段 = {
        "id",
        "name",
        "version",
        "visibility",
        "sourceType",
        "description",
        "features",
        "createdAt",
        "updatedAt",
    }

    for 索引项 in 注册表["templates"]:
        模板编号 = 索引项.get("id")
        if not isinstance(模板编号, str):
            错误.append("注册表存在缺少 id 的条目")
            continue
        try:
            模板目录 = 安全模板路径(模板根目录, 模板编号)
        except ValueError as 异常:
            错误.append(str(异常))
            continue
        if 模板编号 in 已见编号:
            错误.append(f"注册表模板 ID 重复：{模板编号}")
        已见编号.add(模板编号)
        元数据路径 = 模板目录 / "template.json"
        if not 元数据路径.is_file():
            错误.append(f"缺少模板元数据：{元数据路径}")
            continue
        try:
            元数据 = json.loads(元数据路径.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as 异常:
            错误.append(f"模板元数据无法解析：{模板编号}：{异常}")
            continue
        缺失 = sorted(必需字段 - 元数据.keys())
        if 缺失:
            错误.append(f"模板 {模板编号} 缺少字段：{', '.join(缺失)}")
        if 元数据.get("id") != 模板编号:
            错误.append(f"模板 {模板编号} 的元数据 id 不一致")
        for 字段 in ("name", "version", "visibility", "sourceType", "features", "updatedAt"):
            if 索引项.get(字段) != 元数据.get(字段):
                错误.append(f"模板 {模板编号} 的注册表字段与元数据不一致：{字段}")
        if 元数据.get("visibility") not in {"private", "public"}:
            错误.append(f"模板 {模板编号} 的 visibility 必须是 private 或 public")
        if 元数据.get("visibility") == "private" and not 允许私有模板:
            错误.append(
                f"模板 {模板编号} 是 private，但当前模板库不允许保存私有模板"
            )
        for 字段 in ("entry", "style", "content"):
            相对路径 = 元数据.get(字段)
            if 相对路径 and not (模板目录 / 相对路径).is_file():
                错误.append(f"模板 {模板编号} 的 {字段} 文件不存在：{相对路径}")

    实际目录 = {
        路径.name
        for 路径 in 模板根目录.iterdir()
        if 路径.is_dir() and not 路径.name.startswith(".")
    } if 模板根目录.exists() else set()
    未登记 = sorted(实际目录 - 已见编号)
    if 未登记:
        错误.append(f"存在未登记的模板目录：{', '.join(未登记)}")

    if 错误:
        for 项 in 错误:
            print(f"[错误] {项}", file=sys.stderr)
        return 1
    print(f"模板校验通过，共 {len(已见编号)} 个模板。")
    return 0


def 创建解析器() -> argparse.ArgumentParser:
    解析器 = argparse.ArgumentParser(description="管理简历模板注册表")
    解析器.add_argument(
        "--templates-root",
        type=Path,
        required=True,
        help="模板根目录，目录中应包含 registry.json",
    )
    子命令 = 解析器.add_subparsers(dest="command", required=True)

    列出 = 子命令.add_parser("list", help="列出已注册模板")
    列出.add_argument("--json", action="store_true", help="以 JSON 输出")
    列出.set_defaults(handler=命令_列出)

    注册 = 子命令.add_parser("register", help="把现有简历工程注册为模板")
    注册.add_argument("--id", required=True, help="小写连字符模板 ID")
    注册.add_argument("--name", required=True, help="模板显示名称")
    注册.add_argument("--source", type=Path, required=True, help="简历工程源目录")
    注册.add_argument("--description", required=True, help="模板适用场景说明")
    注册.add_argument("--version", default="1.0.0", help="语义化版本")
    注册.add_argument(
        "--visibility",
        choices=("private", "public"),
        default="private",
        help="模板隐私级别",
    )
    注册.add_argument(
        "--source-type",
        choices=("html", "pdf-rebuild"),
        default="html",
        help="模板来源类型",
    )
    注册.add_argument(
        "--feature",
        action="append",
        help="模板能力，可重复传入",
    )
    注册.add_argument("--replace", action="store_true", help="明确替换同 ID 模板")
    注册.set_defaults(handler=命令_注册)

    复制 = 子命令.add_parser("clone", help="把模板复制为新的简历工程")
    复制.add_argument("--id", required=True, help="模板 ID")
    复制.add_argument("--destination", type=Path, required=True, help="新工程目标目录")
    复制.set_defaults(handler=命令_复制)

    校验 = 子命令.add_parser("validate", help="校验注册表、元数据和文件")
    校验.set_defaults(handler=命令_校验)
    return 解析器


def main() -> int:
    参数 = 创建解析器().parse_args()
    参数.templates_root = 参数.templates_root.expanduser()
    try:
        return 参数.handler(参数)
    except ValueError as 异常:
        print(f"错误：{异常}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
