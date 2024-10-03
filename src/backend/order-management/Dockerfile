# Simple Dockerfile to build the image for a node.js application
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# RUN npm run build

EXPOSE 3000

CMD [npx, tsx, src/index.ts]
# CMD ["npm", "run", "start"]