# Etapa 1: Build
FROM node:20-alpine AS builder

# Crear directorio de la app
WORKDIR /usr/src/app

# Instalar dependencias del sistema (opcional pero útil si usas bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++

# Copiar archivos de definición de dependencias
COPY package.json yarn.lock ./

# Instalar TODAS las dependencias (incluye devDependencies para poder compilar Nest)
RUN yarn install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar NestJS a JavaScript (carpeta dist)
RUN yarn build

# Etapa 2: Runtime (imagen más pequeña)
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Solo copias lo necesario para correr la app
COPY package.json yarn.lock ./

# Instalar solo dependencias de producción
RUN yarn install --frozen-lockfile --production

# Copiar el build compilado desde la etapa builder
COPY --from=builder /usr/src/app/dist ./dist

# (Opcional) Si usas archivos como .env.production puedes copiarlos aquí
# COPY .env.production .env

# Puerto que expone tu app Nest (ajusta si usas otro)
EXPOSE 3000

# Comando para iniciar Nest en modo producción
CMD ["yarn", "start:prod"]
