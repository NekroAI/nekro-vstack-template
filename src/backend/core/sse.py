import asyncio
import json
import sys
from collections import deque
from contextlib import suppress
from typing import Any, Dict, List, Optional

from sse_starlette.event import ServerSentEvent

from src.backend.config.settings import settings


class SSEManager:
    """通用 SSE 管理器"""

    def __init__(self):
        self.connections: List[asyncio.Queue] = []

    async def subscribe(self):
        """订阅实时消息"""
        queue = asyncio.Queue()
        self.connections.append(queue)
        try:
            while True:
                message = await queue.get()
                if message is None:
                    # 关闭信号
                    break
                yield message
        except asyncio.CancelledError:
            pass
        finally:
            if queue in self.connections:
                self.connections.remove(queue)

    async def broadcast(self, data: Any, event: str = "message"):
        """广播消息给所有连接"""
        if not self.connections:
            return

        message = ServerSentEvent(data=json.dumps(data, default=str), event=event)
        # 复制列表以避免在迭代时修改
        for queue in list(self.connections):
            with suppress(Exception):
                queue.put_nowait(message)

    async def shutdown(self):
        """关闭所有连接"""
        for queue in list(self.connections):
            with suppress(Exception):
                queue.put_nowait(None)
        self.connections.clear()


class LogStreamManager:
    """日志流管理器（带缓冲）"""

    def __init__(self, capacity: int = settings.LOG_BUFFER_SIZE):
        self.buffer = deque(maxlen=capacity)
        self.sse_manager = SSEManager()
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def set_loop(self, loop: asyncio.AbstractEventLoop):
        """设置事件循环（在应用启动时调用）"""
        self._loop = loop

    def emit(self, message: str):
        """
        Loguru Sink 回调
        注意：Loguru 是同步调用的，这里需要桥接到 AsyncIO
        """
        try:
            # 解析 Loguru 的 JSON 格式日志
            record = json.loads(message)

            # 提取关键信息
            r = record.get("record", {})

            # 简化日志结构以减少传输量
            log_entry = {
                "id": r.get("id"),
                "time": r.get("time", {}).get("repr"),
                "level": r.get("level", {}).get("name"),
                "message": r.get("message"),
                "module": r.get("name"),
                "line": r.get("line"),
                "exception": r.get("exception"),  # 异常信息 (dict or None)
                "extra": r.get("extra"),  # 额外信息 (dict)
                "process": r.get("process", {}).get("name"),
                "thread": r.get("thread", {}).get("name"),
            }

            # 存入缓冲 (deque 是线程安全的)
            self.buffer.append(log_entry)

            # 异步广播
            # 必须使用 run_coroutine_threadsafe 来跨线程/同步上下文调度
            if self._loop and self._loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    self.sse_manager.broadcast(log_entry, event="log"),
                    self._loop,
                )
            else:
                # 尝试获取当前 loop (作为 fallback)
                try:
                    loop = asyncio.get_running_loop()
                    if loop.is_running():
                        loop.create_task(
                            self.sse_manager.broadcast(log_entry, event="log"),
                        )
                except RuntimeError:
                    # 确实没有 loop，只能放弃实时推送（但 buffer 已保存）
                    pass

        except Exception as e:
            # 打印错误到标准错误输出，避免污染 Loguru 导致递归
            print(f"Error in LogStreamManager.emit: {e}", file=sys.stderr)

    async def stream(self):
        """生成流（历史 + 实时）"""
        # 1. 发送历史日志
        # 创建副本以避免在迭代期间被其他协程修改
        history_logs = list(self.buffer)
        for log in history_logs:
            yield ServerSentEvent(data=json.dumps(log, default=str), event="log")

        # 2. 发送实时日志
        async for msg in self.sse_manager.subscribe():
            yield msg

    async def shutdown(self):
        """关闭日志流服务"""
        await self.sse_manager.shutdown()


# 全局单例
log_stream_manager = LogStreamManager()
