const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    init_db();
  }
});

function init_db() {
  const projects_table = `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT,
      root_folder_id INTEGER,
      FOREIGN KEY (root_folder_id) REFERENCES folders (id)
    )
  `;

  const folders_table = `
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      folder_id INTEGER,
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    )
  `;

  const files_table = `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      folder_id INTEGER,
      type TEXT,
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    )
  `;

  db.serialize(() => {
    db.run(projects_table);
    db.run(folders_table);
    db.run(files_table);
  });
}

module.exports = db;
