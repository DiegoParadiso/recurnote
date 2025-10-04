# Imagen base de Node
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json primero
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Puerto que exponemos
EXPOSE 5001

# Comando para levantar la app en dev
CMD ["npm", "run", "dev"]
