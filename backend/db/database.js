const mysql = require('mysql2/promise');

let db;

async function init() {
  db = await mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'mealplan',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mealplan',
    waitForConnections: true,
    connectionLimit: 10,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS meals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      meal_type VARCHAR(50) NOT NULL,
      \`desc\` TEXT,
      time_minutes INT,
      tags JSON,
      suitable_for JSON,
      ingredients JSON,
      steps JSON,
      notes_you TEXT,
      notes_wife TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS weekly_plan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      week_start DATE NOT NULL,
      day_name VARCHAR(20) NOT NULL,
      meal_type VARCHAR(20) NOT NULL,
      meal_id INT,
      custom_note TEXT,
      UNIQUE KEY uq_plan (week_start, day_name, meal_type),
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS shopping_list (
      id INT AUTO_INCREMENT PRIMARY KEY,
      week_start DATE NOT NULL,
      ingredient VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      checked TINYINT(1) DEFAULT 0,
      UNIQUE KEY uq_shopping (week_start, ingredient)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS day_overrides (
      id INT AUTO_INCREMENT PRIMARY KEY,
      week_start DATE NOT NULL,
      day_name VARCHAR(20) NOT NULL,
      override_type VARCHAR(50),
      label VARCHAR(255),
      UNIQUE KEY uq_override (week_start, day_name)
    )
  `);

  console.log('Database initialised');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialised');
  return db;
}

module.exports = { init, getDb };
