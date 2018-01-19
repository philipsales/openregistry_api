FROM node:8.9
RUN mkdir -p /usr/src/pcariapi
WORKDIR /usr/src/pcariapi
COPY package.json /usr/src/pcariapi/
COPY package-lock.json /usr/src/pcariapi/
RUN npm install
COPY . /usr/src/pcariapi
EXPOSE 3000
CMD ["node", "server/server.js"]