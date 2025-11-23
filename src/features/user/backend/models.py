"""
用户数据库模型
使用Tortoise-ORM定义
"""

from tortoise import fields
from tortoise.models import Model


class User(Model):
    """用户模型"""

    id = fields.IntField(pk=True, description="用户ID")
    username = fields.CharField(max_length=50, unique=True, description="用户名")
    hashed_password = fields.CharField(max_length=128, description="加密后的密码")
    email = fields.CharField(max_length=100, unique=True, description="邮箱")
    nickname = fields.CharField(max_length=50, null=True, description="昵称")
    role = fields.CharField(max_length=20, default="user", description="角色")
    is_active = fields.BooleanField(default=True, description="是否激活")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "users"
        table_description = "用户表"

    def __str__(self):
        return f"User(id={self.id}, username={self.username})"

