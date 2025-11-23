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
    print(f"📂 Static files directory set to: {os.environ['STATIC_FILES_DIR']}")

    # --- 诊断信息 (用于排查 migrations 丢失问题) ---
    print(f"🔍 Diagnostic: Checking directory contents of {base_dir}")
    try:
        items = [p.name for p in base_dir.iterdir()]
        print(f"   Contents: {items}")

        migrations_check = base_dir / "migrations"
        if migrations_check.exists():
            mig_items = [p.name for p in migrations_check.iterdir()]
            print(f"   ✅ 'migrations' folder found. Contents: {mig_items}")
        else:
            print(f"   ❌ 'migrations' folder NOT found at {migrations_check}")
            # 尝试检查 _internal
            internal_dir = base_dir / "_internal"
            if internal_dir.exists():
                internal_items = [p.name for p in internal_dir.iterdir()]
                print(f"   Checking _internal: {internal_items}")
                mig_internal = internal_dir / "migrations"
                if mig_internal.exists():
                    print("   ✅ 'migrations' found in _internal.")
    except Exception as e:
        print(f"   Diagnostic failed: {e}")
    # -----------------------------------------------

import uvicorn

from src.backend.config.settings import settings
from src.backend.main import app


def main():
    """桌面端启动入口"""

    # 启动浏览器
    host = settings.HOST
    port = settings.PORT

    # 浏览器访问地址：优先使用 localhost 以便用户访问
    access_host = "localhost" if host == "0.0.0.0" else host
    url = f"http://{access_host}:{port}"

    print(f"🚀 Starting Desktop App at {url}")

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
                print(f"🔧 Fixed Database URL for Windows: {settings.DATABASE_URL}")

    uvicorn.run(app, host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
