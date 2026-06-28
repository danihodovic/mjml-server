FROM node:26-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json /app/

RUN npm ci --omit=dev

EXPOSE 15500

COPY . /app/

ENTRYPOINT ["node", "./index.js"]
