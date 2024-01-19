FROM node:18

COPY package*.json ./

RUN npm install

RUN adduser user --disabled-password --gecos ""
USER user
WORKDIR /usr/src/app

COPY ./src/* ./src/
COPY ./src/models/* ./src/models/
COPY ./index.js .
COPY ./config.yml .

EXPOSE 1234
CMD [ "node", "index.js"]
