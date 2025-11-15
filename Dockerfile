# ---------------------------------------------------
# STEP 1 — FRONTEND BUILD
# ---------------------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Install frontend deps
COPY frontend/package*.json ./
RUN npm install

# Copy frontend src
COPY frontend/ ./

# Build with env
ENV VITE_API_BASE_URL=https://schedulify-uzrl.onrender.com/api
RUN npm run build

# ---------------------------------------------------
# STEP 2 — BACKEND BUILD
# ---------------------------------------------------
FROM node:20-alpine AS backend-build
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend deps
RUN cd backend && npm install --production


# ---------------------------------------------------
# STEP 3 — RUNTIME IMAGE (FINAL)
# ---------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Copy frontend build into backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Install backend node_modules already built in step 2
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules

EXPOSE 3000

CMD ["node", "backend/app.js"]

