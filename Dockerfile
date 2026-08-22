FROM node:20-alpine

WORKDIR /app

# Install production dependencies inside the image (mongodb, ws, …).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
