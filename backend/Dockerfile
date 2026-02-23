FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm ci --production --silent
COPY . .
ENV PORT 10000
EXPOSE 10000
CMD ["node", "server.js"]
