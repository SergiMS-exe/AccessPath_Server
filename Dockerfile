# Dockerfile para Puppeteer (node 20)
FROM node:20-bullseye-slim AS builder

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (si existe) e instalar dependencias
COPY package*.json ./
RUN npm install --omit-dev

# Copiar el resto del código fuente
COPY . .

# Transpilar TypeScript a JavaScript
RUN npm run build

# Fase final para una imagen más liviana
FROM node:20-bullseye-slim AS runtime

# Instalar dependencias necesarias para Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    libxshmfence1 \
    lsb-release \
    xdg-utils \
    wget \
    unzip \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo los archivos necesarios de la fase de compilación
COPY --from=builder /app/package*.json ./
RUN npm install --omit-dev
COPY --from=builder /app/dist ./dist

# Exponer el puerto en el que corre la aplicación
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start"]
