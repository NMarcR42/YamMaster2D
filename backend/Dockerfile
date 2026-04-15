FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# On expose le port 3005 par defaut
EXPOSE 3005

CMD ["node", "index.js"]