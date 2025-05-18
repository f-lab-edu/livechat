FROM node:20-alpine

ENV TZ=Asia/Seoul

WORKDIR /app
RUN mkdir -p logs

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["node", "dist/main"]
