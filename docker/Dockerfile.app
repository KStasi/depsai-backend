FROM node:20.11.1-alpine3.19

WORKDIR /usr/src/app

RUN apk add --no-cache docker-cli docker openrc

RUN rc-update add docker boot

COPY . .

RUN chmod +x ./scripts/create-tmp-docker-file.sh

RUN npm install -g pnpm

RUN npm install -g gvmkit-build

RUN pnpm install

RUN mkdir -p /usr/src/app/tmp

# RUN pnpm run build

# CMD ["sh", "-c", "pnpm start"]
CMD ["sh", "-c", "pnpm run start:dev"]
