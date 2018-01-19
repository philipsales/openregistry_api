FROM node:8.9
RUN mkdir -p /usr/src/authapi
WORKDIR /usr/src/authapi
COPY package.json /usr/src/authapi/
COPY package-lock.json /usr/src/authapi/
RUN npm install
COPY . /usr/src/authapi
EXPOSE 3000
CMD ["node", "server/server.js"]