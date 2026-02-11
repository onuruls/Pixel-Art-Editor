/**
 * AI Routes - Endpoints for AI-powered sprite generation
 */

const express = require("express");
const router = express.Router();
const { Folder, File } = require("../db/db");
const { generateImage } = require("../services/huggingfaceClient");
const { processToPixelSprite, TARGET_SIZE } = require("../services/pixelSpritePostprocess");
const fileSystemService = require("../db/services/FileSystemService");
const config = require("../config");
const path = require("path");
const fs = require("fs");

const MAX_PROMPT_LENGTH = 300;
const VALID_PALETTES = [16, 32, 64];
const DEFAULT_PALETTE = 32;

/**
 * POST /api/ai/generate-sprite
 * Generate a pixel-art sprite from a text prompt
 */
router.post("/generate-sprite", async (req, res) => {
  try {
    const {
      prompt,
      folderId,
      fileName = "ai-sprite",
      palette = DEFAULT_PALETTE,
      removeBackground = false,
      seed = null,
    } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
      });
    }

    // Validate palette
    if (!VALID_PALETTES.includes(Number(palette))) {
      return res.status(400).json({
        error: `Invalid palette value. Must be one of: ${VALID_PALETTES.join(", ")}`,
      });
    }

    // Validate folderId
    if (!folderId) {
      return res.status(400).json({ error: "folderId is required" });
    }

    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      return res.status(400).json({ error: "Folder not found" });
    }

    // Check for HF token
    if (!process.env.HF_API_TOKEN) {
      return res.status(401).json({
        error: "AI features require HF_API_TOKEN environment variable to be set",
      });
    }

    // Enhance prompt for better pixel art results
    const enhancedPrompt = `pixel art sprite, ${prompt.trim()}, centered, simple, flat colors, 2D game asset`;

    // Generate image from HF
    let rawImageBuffer;
    try {
      rawImageBuffer = await generateImage(enhancedPrompt, seed);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({ error: err.message });
    }

    // Post-process to pixel art sprite
    const spriteBuffer = await processToPixelSprite(rawImageBuffer, {
      palette: Number(palette),
      removeBackground: Boolean(removeBackground),
    });

    // Create file in storage
    await fileSystemService.create_directory_if_not_exists();
    const storedFilename = `${require("crypto").randomUUID()}.png`;
    const fullPath = path.join(config.UPLOADS_DIR, storedFilename);

    fs.writeFileSync(fullPath, spriteBuffer);

    // Sanitize fileName for display
    let displayName = fileName.replace(/\.png$/i, "").trim() || "ai-sprite";
    displayName = displayName.replace(/[^a-zA-Z0-9_\-\s]/g, "");

    // Create default sprite data structure (matching existing format)
    const matrix = await createMatrixFromPng(spriteBuffer);
    const spriteData = {
      frames: [{ matrix }],
      palette: ["#A4A5A6", "#A4A5A6", "#A4A5A6", "#A4A5A6", "#A4A5A6", "#A4A5A6"],
      selectedColor: "#000000",
      secondaryColor: "#FFFFFF",
    };

    // Check for duplicate name and generate unique if needed
    let existingFile = await File.findOne({
      where: { name: displayName, folder_id: folderId, type: "png" },
    });

    if (existingFile) {
      displayName = `${displayName}_${Date.now()}`;
    }

    // Create DB record
    const newFile = await File.create({
      name: displayName,
      type: "png",
      filepath: storedFilename,
      data: spriteData,
      folder_id: folderId,
    });

    // Return response
    res.status(201).json({
      file: {
        id: newFile.id,
        name: newFile.name,
        url: `/uploads/${storedFilename}`,
        folderId: newFile.folder_id,
        type: newFile.type,
      },
      meta: {
        model: process.env.HF_MODEL_ID || "stabilityai/stable-diffusion-2-1",
        generatedAt: new Date().toISOString(),
        palette: Number(palette),
        size: TARGET_SIZE,
      },
    });
  } catch (error) {
    console.error("Error generating AI sprite:", error);
    res.status(500).json({ error: "Failed to generate sprite" });
  }
});

/**
 * Create a matrix from PNG buffer for sprite editor compatibility
 * @param {Buffer} pngBuffer - PNG image buffer
 * @returns {Promise<Array>} 64x64 RGBA matrix
 */
async function createMatrixFromPng(pngBuffer) {
  const sharp = require("sharp");
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const matrix = [];
  for (let y = 0; y < info.height; y++) {
    const row = [];
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      row.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
    }
    matrix.push(row);
  }
  return matrix;
}

module.exports = router;
