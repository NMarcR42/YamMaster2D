const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'db', 
  database: 'yam_master',
  password: 'casino_password',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Erreur de connexion à Postgres:', err.stack);
  }
  console.log('✅ Connecté à la base de données Postgres');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};