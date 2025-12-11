# Stage 1: Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production=false

# Copia o restante dos arquivos
COPY . .

# Copia .env.production para .env
RUN cp .env.production .env

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copia os arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 8080 (padrão do GCP Cloud Run)
EXPOSE 8080

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
