# ⚔️ Yam Master: Azeroth Edition 

<p align="center">
  <img src="https://img.shields.io/badge/Lore-World%20of%20Warcraft-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-React%20Native%20%7C%20Node.js%20%7C%20Socket.io-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge" />
</p>

**Yam Master: Azeroth Edition** est une réinvention stratégique du célèbre jeu de dés, transposée dans l'univers de **World of Warcraft**. Ce n'est plus seulement une question de chance, mais une guerre de territoire en temps réel entre les deux factions iconiques d'Azeroth.

---

## 📜 Le Lore : La Bataille pour la Grille

Alors que les tensions atteignent leur paroxysme entre Orgrimmar et Hurlevent, la **Horde** et l'**Alliance** se disputent le contrôle de zones stratégiques sur une grille mystique. Chaque combinaison de dés réussie représente une manœuvre militaire permettant de placer une unité sur le champ de bataille (la grille 5x5).

### 🚩 Les Factions
* 🔴**La Horde (Rouge)** : Portés par la force brute et l'honneur. Représentés par des guerriers prêts à tout pour la victoire.
* 🔵**L'Alliance (Bleu)** : Guidés par la Lumière et la discipline. Leurs tactiques sont précises et défensives.

Le but est simple mais impitoyable : **Dominer la grille**. Alignez vos troupes pour fortifier vos positions ou bloquez l'avancée ennemie avant qu'ils ne capturent vos bastions.

---

## 🎮 Mécaniques de Jeu & Stratégie

Le jeu fusionne les règles du **Yams (Yahtzee)** et une mécanique de **capture de territoire**.

1.  **Phase de Dés** : Le joueur dispose de 3 lancers par tour. Il peut verrouiller ses dés pour viser des combinaisons (Brelan, Carré, Full, Suite, ou le puissant Yam).
2.  **Placement Tactique** : Une combinaison validée débloque des cases spécifiques sur la grille 5x5.
3.  **Gestion des Ressources** : Chaque camp commence avec **12 pions**. Chaque pose de pion est définitive et réduit vos réserves.
4.  **Conditions de Victoire** : 
    * **Le Choc de Guerre** : Aligner **5 pions** (Horizontal, Vertical ou Diagonal) pour une victoire instantanée.
    * **L'Attrition** : Si les pions sont épuisés, le serveur compare les scores basés sur les alignements de 3 et 4 pions.

---

## 🏗️ Architecture Technique

Le projet repose sur une architecture **Event-Driven** (pilotée par les événements) garantissant une synchronisation millimétrée entre les joueurs.

### Flux de Données (Real-time)
* **Backend (Node.js/Express)** : Le "Cerveau". Il valide chaque lancer de dé et chaque placement de pion pour éviter toute triche. Il gère le matchmaking via une file d'attente (`queue`).
* **Socket.io** : Assure le transport des données bidirectionnel avec une latence minimale.
* **Frontend (React Native/Expo)** : Une interface réactive qui consomme le `gameState` envoyé par le serveur.



### Architecture du Projet

```text
.
├── docker-compose.yml     # Orchestration des services (DB + App)
├── backend/               # Dossier Serveur Node.js
│   ├── index.js           # Point d'entrée & Sockets
│   ├── Dockerfile         # Image Docker du serveur
│   ├── init.sql           # Schéma PostgreSQL
│   ├── controllers/       # Auth & Persistance
│   └── services/          # Logique métier (IA, Scores)
└── frontend/              # Application Mobile (React Native)
    ├── App.js             # Entrée de l'application
    ├── .env               # Configuration URLs
    └── contexts/          # Gestion de l'état (Socket.context)
```

## 🛠️ Configuration & Installation
### 📋 Pré-requis

    Docker & Docker Desktop (recommandé pour la base de données et le serveur).

    Node.js (LTS) installé localement pour le Frontend.
    **Node.js** : Version **18.x (LTS)** minimum.

    Expo Go (sur smartphone) ou un navigateur web.

### 🐳 Lancement Rapide (Docker)

Cette méthode lance automatiquement la base de données PostgreSQL et le Backend Node.js.

    À la racine du projet, lancez :
    Bash

    docker-compose up --build

    Le serveur sera accessible sur http://localhost:3005.

    La base de données sera initialisée automatiquement via ./backend/init.sql.

### 📱 Configuration du Frontend (React Native / Expo)

Le frontend a besoin de savoir où se trouve le serveur.

    Allez dans le dossier /frontend.

    Installez les dépendances :
    Bash

    npm install
    (Optionnel) "npm audit fix" si des vulnérabilités sont présentes

    Créez un fichier .env dans /frontend/ (utilisez .env.example comme modèle) :
    Extrait de code

    # Pour tester sur navigateur (Web)
    EXPO_PUBLIC_API_URL=http://localhost:3005

    # POUR TESTER SUR MOBILE PHYSIQUE :
    # Remplacez localhost par VOTRE IP LOCALE (ex: http://192.168.1.XX:3005)

    Lancez l'application :
    Bash

    npx expo start -c

        Appuyez sur w pour lancer la version Web (recommandé pour la correction rapide).

        Scannez le QR Code avec Expo Go pour tester sur mobile (vérifiez que votre smartphone est sur le même Wi-Fi).

### ⚙️ Détails Techniques des Ports

Pour éviter les conflits avec d'autres services (comme React ou Postgres local), le projet utilise les ports suivants :

    3005 : Backend API & Socket.io (mappé dans Docker).

    5432 : PostgreSQL (interne au réseau Docker).

    8081 : Serveur de développement Expo Metro.

    Note sur le mode Web : Si vous obtenez une erreur de connexion (Network Error) sur navigateur, assurez-vous que le .env du frontend pointe bien sur localhost:3005 et que vous avez relancé Expo avec l'option -c.
