FROM node:erbium-alpine

WORKDIR /usr/src/app

EXPOSE 3000

COPY ./package.json ./
COPY ./yarn.lock ./

COPY . .

RUN yarn

CMD ["yarn", "run", "dev"]