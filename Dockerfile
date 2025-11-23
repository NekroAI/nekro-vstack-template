# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy frontend dependency files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY vite.config.ts postcss.config.js tailwind.config.js ./
COPY index.html ./
COPY build.env .env.production

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code (including features which contain frontend code)
COPY src ./src
COPY public ./public

RUN pnpm build

# Stage 2: Build Backend Environment
FROM python:3.11-slim AS backend-builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy backend dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
ENV UV_COMPILE_BYTECODE=1
RUN uv sync --frozen --no-dev --no-install-project

# Stage 3: Final Image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for psutil or other compiled extensions)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=backend-builder /app/.venv /app/.venv
# Enable venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy backend code
COPY src/backend ./src/backend
COPY src/config ./src/config
COPY src/features ./src/features
# We also need backend core/features. 
# Since python code structure relies on 'src' package.

# Create data and logs directories
RUN mkdir -p data logs

# Copy migrations for automatic database upgrades
COPY migrations ./migrations

# Copy frontend build to static directory
COPY --from=frontend-builder /app/dist /app/static

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
# Force backend to use this host/port
ENV HOST=0.0.0.0
ENV PORT=9871

# Expose port
EXPOSE 9871

# Run application
CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "9871"]

