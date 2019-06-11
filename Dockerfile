FROM node:carbon

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn --pure-lockfile

COPY . .

RUN yarn build
RUN yarn global add firebase-tools

ENTRYPOINT ["yarn"]
