# Utiliza una imagen base de Node.js. Aquí usamos la versión "slim" para un tamaño de imagen reducido
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el archivo 'package.json' (y 'package-lock.json' si existe) al directorio de trabajo
COPY package*.json ./

# Instala todas las dependencias, incluyendo las de desarrollo para la transpilación
RUN npm install --verbose

# Copia los archivos y directorios del proyecto al directorio de trabajo en el contenedor
COPY . .

# Transpila el código TypeScript a JavaScript
RUN npm run build

# Elimina las dependencias de desarrollo para reducir el tamaño de la imagen
RUN npm prune --production

# Expone el puerto en el que se ejecutará tu aplicación
EXPOSE 3000

# Define el comando para ejecutar tu aplicación
CMD ["npm", "start"]
