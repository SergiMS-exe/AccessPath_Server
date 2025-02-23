FROM node:18-alpine AS builder

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
FROM node:18-alpine AS runtime
WORKDIR /app

# Copiar solo los archivos necesarios de la fase de compilación
COPY --from=builder /app/package*.json ./
RUN npm install --omit-dev
COPY --from=builder /app/dist ./dist

# Exponer el puerto en el que corre la aplicación
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start"]
