FROM node:16-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json /app/

RUN npm install

EXPOSE 15500

COPY . /app/

ENTRYPOINT ["node", "./index.js"]
