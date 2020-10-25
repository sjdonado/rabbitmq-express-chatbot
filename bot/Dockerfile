FROM node:erbium-alpine

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./

COPY . .

RUN yarn

CMD ["yarn", "run", "dev"]