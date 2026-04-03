FROM node:18

# Dossier de travail
WORKDIR /usr/src/app

# Copie du package.json ET du package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

# Port exposé
EXPOSE 3000

# Lancement
CMD ["node", "index.js"]