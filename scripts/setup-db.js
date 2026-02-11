const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "mission-control.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT,
    timestamp INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('gateway_url', 'http://127.0.0.1:18789');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('gateway_token', '');
`);

console.log("Database setup complete.");
db.close();
