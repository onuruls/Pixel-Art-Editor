FROM node:20-slim

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy frontend source (served by backend)
COPY frontend/ ../frontend/

# Create data directory structure to avoid permission issues if volume mounted
RUN mkdir -p .data/uploads && chmod 777 -R .data

# Environment
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_DIR=/app/backend/.data

EXPOSE 3000

CMD ["node", "server.js"]
