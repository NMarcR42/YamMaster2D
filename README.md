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
* **La Horde (Rouge)** : Portés par la force brute et l'honneur. Représentés par des guerriers prêts à tout pour la victoire.
* **L'Alliance (Bleu)** : Guidés par la Lumière et la discipline. Leurs tactiques sont précises et défensives.

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



### Architecture du Code (Backend)
* `/services` : Logique pure (calcul des scores, détection des suites, IA du Bot).
* `/controllers` : Gestion de l'authentification et de la persistance (PostgreSQL).
* `index.js` : Point d'entrée gérant les cycles de vie des sockets.

---

## 🛠️ Configuration & Installation

### 🔑 Variables d'environnement (.env)
Créez un fichier `.env` dans le dossier `/backend` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=yam_master_db
JWT_SECRET=azeroth_is_bleeding