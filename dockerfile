FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV PORT=3000 \
    TARGET_FORMAT=mp3 \
    AUTO_DELETE=true \
    QUOTA=disabled \
    QOTD=null

CMD ["npm", "start"]
