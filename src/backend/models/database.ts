import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3307),
  user: process.env.MYSQL_USER ?? "dashboard",
  password: process.env.MYSQL_PASSWORD || "robot_dev_local",
  database: process.env.MYSQL_DATABASE ?? "devops_dashboard",
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 5000,
  enableKeepAlive: true,
});

export async function initializeDatabase(): Promise<void> {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      type ENUM('alert', 'discord_webhook', 'metric_threshold', 'service') NOT NULL,
      value TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}
