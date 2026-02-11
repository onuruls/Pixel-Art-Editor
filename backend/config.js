const path = require("path");

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, ".data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "database.db");
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];

// Hugging Face API configuration
const HF_API_TOKEN = process.env.HF_API_TOKEN || "";
const HF_MODEL_ID = process.env.HF_MODEL_ID || "stabilityai/stable-diffusion-2-1";

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  DB_PATH,
  PORT,
  CORS_ORIGIN,
  HF_API_TOKEN,
  HF_MODEL_ID,
};
