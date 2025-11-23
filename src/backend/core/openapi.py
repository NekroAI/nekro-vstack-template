"""
OpenAPI 规范生成工具

统一的 OpenAPI JSON 生成逻辑，避免代码重复
"""

import json
from pathlib import Path
from typing import Any

from src.backend.core.logger import logger


def generate_openapi_json(
    app: Any,
    output_path: str | Path = "openapi.json",
    project_root: Path | None = None,
) -> bool:
    """
    生成 OpenAPI JSON 文件

    Args:
        app: FastAPI 应用实例
        output_path: 输出文件路径（相对于 project_root）
        project_root: 项目根目录，默认为当前工作目录

    Returns:
        bool: 生成是否成功
    """
    try:
        # 获取 OpenAPI schema
        openapi_schema = app.openapi()

        # 确定输出路径
        if project_root is None:
            project_root = Path.cwd()

        output_file = (
            project_root / output_path
            if not Path(output_path).is_absolute()
            else Path(output_path)
        )

        # 写入文件
        output_file.write_text(
            json.dumps(openapi_schema, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        # 统计信息
        file_size = output_file.stat().st_size / 1024
        paths_count = len(openapi_schema.get("paths", {}))

        logger.info(f"✅ OpenAPI 规范已生成: {output_file}")
        logger.debug(f"📄 文件大小: {file_size:.2f} KB")
        logger.debug(f"🔗 API 端点数量: {paths_count}")

    except Exception as e:
        logger.error(f"❌ OpenAPI 规范生成失败: {e}")
        return False
    else:
        return True
