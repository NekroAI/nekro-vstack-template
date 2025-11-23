#!/usr/bin/env python3
"""
生成 OpenAPI JSON 规范文件

无需启动服务器，直接从 FastAPI 应用生成 OpenAPI 规范
"""

import json
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.backend.core.openapi import generate_openapi_json
from src.backend.main import app

if __name__ == "__main__":
    # 支持自定义输出路径
    output_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"

    # 生成 OpenAPI 规范
    success = generate_openapi_json(app, output_path, project_root)

    # 控制台输出（供用户查看）
    if success:
        output_file = project_root / output_path
        print(f"✅ OpenAPI 规范已生成: {output_file}")
        print(f"📄 文件大小: {output_file.stat().st_size / 1024:.2f} KB")

        # 统计端点数量
        import json

        with output_file.open("r", encoding="utf-8") as f:
            schema = json.load(f)
        paths_count = len(schema.get("paths", {}))
        print(f"🔗 API 端点数量: {paths_count}")

    sys.exit(0 if success else 1)
