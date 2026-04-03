-- Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    faction VARCHAR(20) DEFAULT 'horde',
    xp INTEGER DEFAULT 0,
    rank_name VARCHAR(50) DEFAULT 'Éclaireur',
    badge_color VARCHAR(20) DEFAULT '#8b0000',
    avatar_url TEXT
);

-- Table des Rangs (Paliers d'XP)
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    faction VARCHAR(10) NOT NULL, 
    name VARCHAR(50) NOT NULL,
    min_xp INTEGER NOT NULL,
    badge_color VARCHAR(20)
);

-- On vide et on réinsère pour éviter les doublons au redémarrage
TRUNCATE ranks;

INSERT INTO ranks (faction, name, min_xp, badge_color) VALUES 
('horde', 'Éclaireur', 0, '#8b0000'),
('horde', 'Sergent', 500, '#a52a2a'),
('horde', 'Gardien de Pierre', 1500, '#d2691e'),
('horde', 'Garde de Sang', 5000, '#b22222'),
('horde', 'Légionnaire', 10000, '#800000'),
('horde', 'Seigneur du Yam', 25000, '#4b0082'),
('alliance', 'Soldat', 0, '#00008b'),
('alliance', 'Chevalier', 500, '#1e90ff'),
('alliance', 'Paladin', 1500, '#4169e1'),
('alliance', 'Maréchal', 5000, '#0000cd'),
('alliance', 'Commandant', 10000, '#191970'),
('alliance', 'Grand Connétable du Yam', 25000, '#ffd700');