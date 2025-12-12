FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências de build
RUN npm ci

# Copia o restante dos arquivos
COPY . .

# Copia .env.production para .env
RUN cp .env.production .env

# Build da aplicação
RUN npm run build

# Instala o serve globalmente
RUN npm install -g serve

# Expõe a porta 8080
EXPOSE 8080

# Comando para servir os arquivos estáticos do build
CMD ["serve", "-s", "dist", "-l", "8080"]
