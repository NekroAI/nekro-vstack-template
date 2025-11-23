import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# 引入统一路径管理
# 注意：我们需要临时添加 src 到 path 以便在 settings 加载前使用 core.path_conf
# 但由于我们已经在 src/backend/desktop_launcher.py，通常可以直接导入
# 如果是 PyInstaller，所有模块都在一起
try:
    from src.backend.core.path_conf import get_base_dir, get_resource_path
except ImportError:
    # Fallback if path not set up correctly
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from src.backend.core.path_conf import get_base_dir, get_resource_path

# --- 环境预配置 (必须在导入 app/settings 前执行) ---
if getattr(sys, "frozen", False):
    # 1. 设置默认生产环境 (允许外部 env 覆盖)
    os.environ.setdefault("ENVIRONMENT", "production")
    os.environ.setdefault("DEBUG", "false")

    # 2. 配置静态文件路径
    # 使用统一封装的路径查找逻辑
    static_path = get_resource_path("static")

    if static_path:
        # 告诉 main.py 静态文件在哪里
        os.environ["STATIC_FILES_DIR"] = str(static_path.resolve())
        # 注意：这里我们只设置环境变量，打印留给 diagnostics
    else:
        # 如果找不到，设置一个占位符或记录错误（稍后 logger 初始化后记录）
        # print("Warning: 'static' directory not found via get_resource_path")
        pass

import uvicorn
from loguru import logger

from src.backend.config.settings import settings
from src.backend.main import app


def run_diagnostics():
    """运行启动前诊断并美化输出"""
    base_dir = get_base_dir()
    logger.info(f"🔍 Running startup diagnostics in {base_dir}")

    try:
        # 检查根目录
        if base_dir.exists():
            items = sorted([p.name for p in base_dir.iterdir()])
            logger.debug(
                (
                    f"📁 Root contents ({len(items)}): {', '.join(items[:5])}..."
                    if len(items) > 5
                    else f"📁 Root contents: {items}"
                ),
            )

        # 检查 migrations
        migrations_path = get_resource_path("migrations")
        if migrations_path:
            mig_items = sorted([p.name for p in migrations_path.iterdir()])
            logger.success(
                f"✅ 'migrations' folder found at {migrations_path} ({len(mig_items)} files).",
            )
        else:
            logger.error("❌ 'migrations' folder NOT found via get_resource_path")

        # 检查 static
        static_path = get_resource_path("static")
        if static_path:
            logger.success(f"✅ 'static' folder found at {static_path}")
        else:
            logger.error("❌ 'static' folder NOT found via get_resource_path")

    except Exception as e:
        logger.error(f"⚠️ Diagnostics failed: {e}")


def main():
    """桌面端启动入口"""

    # 在生产模式下，运行诊断
    if getattr(sys, "frozen", False):
        run_diagnostics()

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
                base_dir = get_base_dir()
                abs_db_path = (base_dir / p_db_path).resolve()
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
