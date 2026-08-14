FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
