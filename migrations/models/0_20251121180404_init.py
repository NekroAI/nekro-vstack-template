from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL /* 用户ID */,
    "username" VARCHAR(50) NOT NULL UNIQUE /* 用户名 */,
    "hashed_password" VARCHAR(128) NOT NULL /* 加密后的密码 */,
    "email" VARCHAR(100) NOT NULL UNIQUE /* 邮箱 */,
    "nickname" VARCHAR(50) /* 昵称 */,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user' /* 角色 */,
    "is_active" INT NOT NULL DEFAULT 1 /* 是否激活 */,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP /* 创建时间 */,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP /* 更新时间 */
) /* 用户表 */;
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSON NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """


MODELS_STATE = (
    "eJzll21vmzAQx79KlFed1E3EDYTuXdJ2aqa1mbp0m7ZOyGCTWAWTgVlXVf3uu3MgBAhZEq"
    "0PU98guPufOf/Oj3ftMGI8SN5cJjxuv23dtSUNObyU7PutNp3NCisaFHUDLUxBoS3UTVRM"
    "PQVGnwYJBxPjiReLmRKRROlV2jOJfZVa5KB3ldq2ZWMcizwIFHJSl1iUdK5Ss2e7KEyl+J"
    "lyR0UTrqY63e8/wCwk4795kn/Orh1f8ICVeiMYNqDtjrqdadtQqndaiDm4jhcFaSgL8exW"
    "TSO5UAup0DrhksdUcWxexSl2UqZBkMHI+z3PtJDMU1yKYdynaYCoMHo9qeFxlVIW40USiU"
    "Nmie7sBP/4mnS6va59YHVtkOisFpbe/byrBYd5oKZxPm7faz9VdK7QSAuGWGj9XiN5NKXx"
    "apTLMRWgkHoVaI7voYnCkOoabEOqIf3tBFxO1BQ+TWMNws/9i6PT/sWeabzCtiOYDPMpcp"
    "55iHYh5YLqlCZTzpwZTZKbKF4xTJvhrgj9N4xzQwG5mNB/o2wSasDT9SxNmQN3y+7mlp5t"
    "dHbh3iH2BuBB1Uhe+8roeUhFsA3wRcBTD+VDgyJY190NprHJKAZVM0yjNo6l8K63XR2WY3"
    "ZCmgH7JwPXsg5MYHroG89jYYijYCuYuf7xlgC9urdXsbQPGYEn6ZFdWJJNWJJmlqTGUiQO"
    "HEzErxVABxFwo7LhJLAcVwHrQuBDkV0sBLUxSnxcVgkspZbvwUJrsQN3M8ZrmA5Gow/YSJ"
    "gkPwNtGI4rcC/PBiewJmjmIBKKLx8aCtJezJGFQ1Ud9TF4lAj5atblyApsloW+yV8ef1vr"
    "uPAEHTA3feB/aPrdDUc39IyNZHCbVXZNJcbDs5NP4/7Zx1I5jvvjE/To2RTeVqx7VmUmLB"
    "ppfRmOT1v42fo2Oj/RXKNETWL9x0I3/tbGnGiqIkdGNw5lS7tRbs1xlcqdztiO5S5HPrdy"
    "W5bfxUK7xgsut04er1T+9dKFAA0u9a5vaMycmiciUZO27gpJWLVQSSe6VsgWs8zuoX0eC2"
    "/aXnFDzTz76+6otND87ZKaj4h6mV/O9bOZwSNfOX/xOMGUtjgGLYU88WVoc4rl049pbnL8"
    "Mc3m8w/6ytsyTo0tIGby/xPgg1xv4I+KyxW73PtPo/OGA00RUgF5KaGD35nw1H4rEIn68T"
    "yxrqGIvS7tWTm8vbP+1yrXow+jQXUzwgYGwPhJt5f7P0SNpE4="
)
