# ===================================================
# BloodBridge Production Multi-Stage Dockerfile
# Stage 1: Build React Production Frontend
# Stage 2: Python FastAPI Production Runtime with DPDP & WebSockets
# ===================================================

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and build static artifacts
COPY . ./
RUN npm run build

# --- Stage 2: Production Python Backend Runtime ---
FROM python:3.11-slim AS runtime

# System runtime dependencies & security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application code
COPY backend/ ./backend/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Persistent volume directory for SQLite database & logs
RUN mkdir -p /app/data
ENV DATABASE_URL="sqlite:////app/data/bloodbridge.db"
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Health check to ensure service vitality
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn production server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

