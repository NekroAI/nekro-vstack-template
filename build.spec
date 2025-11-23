# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path
import os
import sys
from PyInstaller.utils.hooks import copy_metadata

block_cipher = None

# 获取项目根目录
BASE_DIR = Path(os.getcwd())
BACKEND_DIR = BASE_DIR / "src" / "backend"

# 定义静态文件路径
STATIC_DIR = BASE_DIR / "dist"  # 前端构建产物目录
ASSETS_DIR = BASE_DIR / "src" / "assets"

# 检查前端构建是否完成
if not STATIC_DIR.exists():
    print("Error: Frontend build directory 'dist' not found. Please run 'pnpm build' first.")
    sys.exit(1)

# 数据文件：包含前端静态资源和后端可能需要的配置
datas = [
    (str(STATIC_DIR), "static"),  # 将 dist 映射到 _internal/static
    (str(BASE_DIR / "openapi.json"), "."),
]

# 修复: 显式复制 tortoise-orm 的元数据，解决 importlib.metadata.PackageNotFoundError
datas += copy_metadata("tortoise-orm")

# 隐藏导入：Tortoise ORM 和其他动态加载的库可能需要
hiddenimports = [
    "tortoise.backends.sqlite",
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "src.features.user.backend.models",
    "src.features.dashboard.backend.models",
    "src.features.monitor.backend.models",
    # 手动添加 tortoise 模块依赖
    "tortoise.backends.asyncpg",
    "tortoise.backends.mysql",
    "tortoise.contrib.pydantic",
    # importlib.metadata 兼容性
    "importlib_metadata",
    # aerich 迁移工具
    "aerich.models",
]

a = Analysis(
    [str(BACKEND_DIR / "desktop_launcher.py")],  # 使用新的桌面启动器作为入口
    pathex=[str(BASE_DIR)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='NekroVStack',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True, # 保留控制台以便查看日志，发布时可改为 False
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='NekroVStack',
)

