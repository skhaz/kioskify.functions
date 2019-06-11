FROM node:carbon

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn global add firebase-tools
RUN yarn --pure-lockfile

COPY . .

RUN yarn build
