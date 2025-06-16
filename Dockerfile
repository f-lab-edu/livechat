FROM node:20-alpine

ENV TZ=Asia/Seoul

WORKDIR /app
RUN mkdir -p logs

# ffmpeg 설치
RUN apk add --no-cache ffmpeg
# RUN apt-get update && apt-get install -y ffmpeg


COPY package*.json ./
RUN npm install


RUN mkdir -p cert
# CMD ["sh", "-c", "npx prisma db push && npm run start:dev"]

# CMD ["npm", "run", "start:dev"]
