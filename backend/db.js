const Datastore = require("nedb");
const path = require("path");

// Datenbankdatei definieren
const db_path = path.join(__dirname, "database.db");

// Datenbank initialisieren
const db = new Datastore({ filename: db_path, autoload: true });

module.exports = db;
