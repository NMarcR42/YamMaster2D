# ⚔️ Yam Master: Azeroth Edition (Socket.io & React Native)

<p align="center">
  <a href="https://itunes.apple.com/app/apple-store/id982107779">
    <img alt="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent">
    <img alt="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  </a>
  <a href="https://docs.expo.dev/workflow/web/">
    <img alt="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
</p>

Ce projet est une application mobile full-stack utilisant **React Native (Expo)** et **Socket.io**. Il transforme le jeu de plateau Yam Master en une bataille stratégique entre la **Horde** et l'**Alliance**.

---

## 🚀 Comment l'utiliser (Déploiement)

### 1. Serveur (Backend)
Le serveur gère la logique de jeu, le matchmaking et la persistance.
- `cd backend`
- `npm install`
- Configurez vos accès PostgreSQL dans le contrôleur d'authentification.
- `npm start`
- **Tunneling :** Installez [ngrok](https://ngrok.com/download) et lancez `ngrok http 3000`. Copiez l'URL HTTPS (ex: `https://f733-xxx.ngrok.io`).

### 2. Application (Frontend)
- `npm install`
- Ouvrez le fichier de configuration des sockets (ex: `App.js`) et modifiez la variable `socketEndpoint` avec votre URL ngrok.
- `npx expo start`

---

## 🛠️ Architecture Technique & Variables

### Architecture Logicielle
Le projet suit une séparation stricte des responsabilités :
- **GameService (Backend) :** Centralise la logique pure (calcul des scores, détection des combinaisons, gestion de la grille).
- **Socket Management :** Gère les événements bidirectionnels en temps réel.
- **Hooks React (Frontend) :** Utilisation de `useState` et `useEffect` pour synchroniser l'UI avec l'état du serveur.

### Variables d'État Globales (GameState)
Le jeu repose sur un objet `gameState` complexe synchronisé via socket :
- `currentTurn` : Gère l'alternance entre `player:1` et `player:2`.
- `timer` : Compte à rebours de 60s synchronisé pour éviter la triche côté client.
- `grid` : Matrice 5x5 contenant les objets `cell` (viewContent, owner, canBeChecked).
- `deck` : Objet contenant les dés (`dices`), le `rollsCounter` (max 3) et les états de verrouillage.
- `pions` : Compteur de ressources (12 par joueur).

### Événements Socket Clés
- `game.dices.roll` : Déclenche le lancer côté serveur.
- `game.choices.selected` : Valide la combinaison choisie (Full, Brelan...).
- `game.grid.selected` : Enregistre le placement d'un pion et déclenche le recalcul des scores.
- `game.end` : Émis lorsqu'une condition de victoire est remplie.

---

## 🎮 Logique de Jeu Avancée

### Système de Scoring & Alignements
Le calcul des points est géré par `calculatePlayerScore`. Il parcourt la grille pour identifier les suites de pions :
- **Horizontal & Vertical :** Analyse de chaque ligne et colonne.
- **Diagonales :** Prise en compte de la diagonale principale et secondaire.
- **Pondération :** Un alignement de 3 = 1pt, 4 = 2pts, 5 = 3pts (Victoire).

### Conditions de Victoire
1. **Alignement Total :** Dès qu'un joueur aligne 5 pions, il est déclaré vainqueur (isWinner: true).
2. **Épuisement :** Si un joueur n'a plus de pions, le serveur compare les scores finaux.

---

## 📦 Dépendances et Outils
- **Backend :** `socket.io`, `express`, `pg` (PostgreSQL), `bcrypt` (sécurité), `jsonwebtoken` (Auth), `uniqid` (ID de partie).
- **Frontend :** `socket.io-client`, `react-navigation`, `expo-constants`.

## 📝 Notes de Développement
Contrairement aux WebSockets standards, **Socket.io** permet une gestion robuste des reconnexions et des "rooms". Pour le développement mobile, l'usage de **ngrok** est indispensable pour contourner les restrictions HTTPS de React Native en local.

---
*Développé pour le projet final de développement Mobile & Temps Réel - Univers World of Warcraft.*