FROM node:8.9
RUN mkdir -p /usr/src/pcariapi
RUN mkdir -p /usr/src/pcariapi/uploads/consent_templates
RUN mkdir -p /usr/src/pcariapi/dump
RUN chmod -R 777 /usr/src/pcariapi/uploads
RUN chmod -R 777 /usr/src/pcariapi/dump
RUN apt-get install -y mongodb-org-tools
WORKDIR /usr/src/pcariapi
COPY package.json /usr/src/pcariapi/
COPY package-lock.json /usr/src/pcariapi/
RUN npm install
COPY . /usr/src/pcariapi
EXPOSE 3000
CMD ["node", "server/server.js"]