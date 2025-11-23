"""
Path resolution utilities for cross-platform compatibility (Dev/Docker/Frozen).
"""

import sys
from pathlib import Path


def get_base_dir() -> Path:
    """
    获取应用程序的基准目录

    - Frozen (PyInstaller): sys.executable 所在的目录
    - Dev: 项目根目录
    """
    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent
    # 假设此文件在 src/backend/core/path_conf.py，回退 3 层到根目录
    return Path(__file__).resolve().parents[3]


def get_resource_path(relative_path: str) -> Path | None:
    """
    获取资源文件的绝对路径，自动处理 PyInstaller 的 _internal 目录

    Args:
        relative_path: 资源相对路径 (例如 "static", "migrations")

    Returns:
        Path: 资源的绝对路径（如果找到），否则返回 None
    """
    base_dir = get_base_dir()

    # 1. 优先检查基准目录 (例如 dist/static)
    path_in_base = base_dir / relative_path
    if path_in_base.exists():
        return path_in_base

    # 2. 检查 _internal 目录 (PyInstaller onedir 模式的默认解压位置)
    if getattr(sys, "frozen", False):
        internal_dir = base_dir / "_internal"
        path_in_internal = internal_dir / relative_path
        if path_in_internal.exists():
            return path_in_internal

    # 3. 开发环境回退
    # 如果是在开发环境，直接在项目根目录找
    if not getattr(sys, "frozen", False):  # noqa: SIM102
        # 开发环境下，base_dir 已经是项目根目录
        if path_in_base.exists():
            return path_in_base

    return None
