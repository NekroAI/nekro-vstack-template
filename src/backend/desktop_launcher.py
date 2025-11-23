import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# --- 环境预配置 (必须在导入 app/settings 前执行) ---
if getattr(sys, "frozen", False):
    # 1. 设置默认生产环境 (允许外部 env 覆盖)
    os.environ.setdefault("ENVIRONMENT", "production")
    os.environ.setdefault("DEBUG", "false")

    # 2. 配置静态文件路径
    # PyInstaller 单目录模式: 资源在 sys.executable 同级或 _internal
    # 我们的 spec 配置将 dist 复制到了 static 目录
    base_dir = Path(sys.executable).parent
    static_dir = base_dir / "static"

    # 告诉 main.py 静态文件在哪里
    os.environ["STATIC_FILES_DIR"] = str(static_dir.resolve())

import uvicorn
from loguru import logger

from src.backend.config.settings import settings
from src.backend.main import app


def run_diagnostics(base_dir: Path):
    """运行启动前诊断并美化输出"""
    logger.info(f"🔍 Running startup diagnostics in {base_dir}")

    try:
        # 检查根目录
        items = sorted([p.name for p in base_dir.iterdir()])
        logger.debug(
            (
                f"📁 Root contents ({len(items)}): {', '.join(items[:5])}..."
                if len(items) > 5
                else f"📁 Root contents: {items}"
            ),
        )

        # 检查 migrations
        migrations_check = base_dir / "migrations"
        if migrations_check.exists():
            mig_items = sorted([p.name for p in migrations_check.iterdir()])
            logger.success(f"✅ 'migrations' folder found ({len(mig_items)} files).")
        else:
            logger.warning(f"❌ 'migrations' folder NOT found at {migrations_check}")

            # 尝试检查 _internal
            internal_dir = base_dir / "_internal"
            if internal_dir.exists():
                mig_internal = internal_dir / "migrations"
                if mig_internal.exists():
                    mig_count = len(list(mig_internal.iterdir()))
                    logger.success(
                        f"✅ Found 'migrations' in _internal ({mig_count} files).",
                    )
                else:
                    logger.error("❌ 'migrations' NOT found in _internal either.")
    except Exception as e:
        logger.error(f"⚠️ Diagnostics failed: {e}")


def main():
    """桌面端启动入口"""

    # 在生产模式下，运行诊断
    if getattr(sys, "frozen", False):
        run_diagnostics(Path(sys.executable).parent)

    # 启动浏览器
    host = settings.HOST
    port = settings.PORT

    # 浏览器访问地址：优先使用 localhost 以便用户访问
    access_host = "localhost" if host == "0.0.0.0" else host
    url = f"http://{access_host}:{port}"

    logger.info(f"🚀 Starting Desktop App at {url}")

    # 延迟打开浏览器，确保服务已启动
    def open_browser():
        time.sleep(2)  # 等待 2 秒
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()

    # 启动服务
    # 注意：在 PyInstaller 打包应用中，reload 必须为 False

    # 修正 SQLite 路径 (Windows 打包环境)
    if getattr(sys, "frozen", False) and "sqlite" in settings.DATABASE_URL:
        db_url = settings.DATABASE_URL
        if db_url.startswith("sqlite://"):
            db_path = db_url.replace("sqlite://", "")
            p_db_path = Path(db_path)
            if not p_db_path.is_absolute():
                # 转换为基于 exe 所在目录的绝对路径
                base_path = Path(sys.executable).parent
                abs_db_path = (base_path / p_db_path).resolve()
                # 确保父目录存在
                abs_db_path.parent.mkdir(parents=True, exist_ok=True)
                # 更新设置
                settings.DATABASE_URL = f"sqlite://{abs_db_path}"
                logger.info(
                    f"🔧 Fixed Database URL for Windows: {settings.DATABASE_URL}",
                )

    uvicorn.run(app, host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
