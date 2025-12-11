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

# Build da aplicação
# As variáveis de ambiente serão injetadas em tempo de build
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copia os arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 8080 (padrão do GCP Cloud Run)
EXPOSE 8080

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
