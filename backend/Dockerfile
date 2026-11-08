FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000 \
    --fetch-timeout=300000

COPY . .

EXPOSE 5000

CMD ["npm", "start"]