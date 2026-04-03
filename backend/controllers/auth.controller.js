const db = require('../services/db.service');
const bcrypt = require('bcryptjs'); // Plus stable sur Docker

const AuthController = {
  // --- SYSTÈME DE RANGS ---
  // Met à jour le nom du rang et la couleur selon l'XP actuelle
  updatePlayerRank: async (userId) => {
    const query = `
      UPDATE users 
      SET 
        rank_name = r.name,
        badge_color = r.badge_color
      FROM ranks r
      WHERE users.id = $1 
        AND r.faction = users.faction 
        AND users.xp >= r.min_xp
      AND r.min_xp = (
          SELECT MAX(min_xp) 
          FROM ranks 
          WHERE faction = users.faction AND users.xp >= min_xp
      );
    `;
    try {
      await db.query(query, [userId]);
    } catch (e) {
      console.error("Erreur lors de la mise à jour du rang:", e);
    }
  },

  // --- ACTIONS JOUEUR ---
  register: async (username, password, faction) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Avatar par défaut généré dynamiquement
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
      
      // On insère l'utilisateur
      const query = `
        INSERT INTO users (username, password, faction, avatar_url)
        VALUES ($1, $2, $3, $4) 
        RETURNING id, username, faction, xp, rank_name, avatar_url, badge_color
      `;
      const res = await db.query(query, [username, hashedPassword, faction, avatarUrl]);
      const user = res.rows[0];

      // On s'assure que son rang de départ est correct
      await AuthController.updatePlayerRank(user.id);
      
      return { success: true, user };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Pseudo déjà utilisé ou erreur serveur." };
    }
  },

  login: async (username, password) => {
    try {
      const res = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          delete user.password; // Sécurité
          return { success: true, user };
        }
      }
      return { success: false, error: "Identifiants incorrects." };
    } catch (e) {
      return { success: false, error: "Erreur lors de la connexion." };
    }
  },

  // Ajoute de l'XP à un joueur (ex: +100 après une victoire)
  addXP: async (userId, amount) => {
    try {
      await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [amount, userId]);
      await AuthController.updatePlayerRank(userId);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },

  // --- CLASSEMENT ---
  getLeaderboard: async () => {
    try {
      // On trie par XP, puis par pseudo
      const res = await db.query(`
        SELECT username, xp, badge_color, rank_name, avatar_url 
        FROM users 
        ORDER BY xp DESC, username ASC 
        LIMIT 10
      `);
      return res.rows;
    } catch (e) {
      return [];
    }
  }
};

module.exports = AuthController;