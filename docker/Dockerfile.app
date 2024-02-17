FROM node:20.11.1-alpine3.19

WORKDIR /usr/src/app

RUN apk add --no-cache docker-cli docker openrc

RUN rc-update add docker boot

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["sh", "-c", "pnpm start"]
