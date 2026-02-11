const request = require("supertest");
const path = require("path");
const fs = require("fs");

// Set env before requiring app to ensure config picks it up
process.env.PORT = 3002;
process.env.DATA_DIR = path.resolve(__dirname, "../.data_test_ai");
process.env.DB_PATH = path.join(process.env.DATA_DIR, "test_ai_db.sqlite");
process.env.HF_API_TOKEN = "test_token_for_mocking";

// Ensure clean slate
if (fs.existsSync(process.env.DATA_DIR)) {
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
}

// Create a small valid PNG fixture (8x8 red square)
const createTestPngBuffer = () => {
  const { PNG } = require("pngjs");
  const png = new PNG({ width: 64, height: 64 });
  
  // Fill with solid color
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (64 * y + x) << 2;
      png.data[idx] = 255;     // R
      png.data[idx + 1] = 0;   // G
      png.data[idx + 2] = 0;   // B
      png.data[idx + 3] = 255; // A
    }
  }
  
  return PNG.sync.write(png);
};

// Mock the huggingface client BEFORE requiring the app
jest.mock("../services/huggingfaceClient", () => ({
  generateImage: jest.fn().mockImplementation(() => {
    return Promise.resolve(createTestPngBuffer());
  }),
}));

const app = require("../server");
const { sequelize, Folder, Project } = require("../db/db");

let testFolderId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  // Create a test folder to use for AI generation
  const folder = await Folder.create({ name: "Test Root" });
  testFolderId = folder.id;
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.env.DATA_DIR, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
});

afterAll(async () => {
  await sequelize.close();
  // Clean up
  if (fs.existsSync(process.env.DATA_DIR)) {
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
});

describe("AI Sprite Generation API", () => {
  describe("POST /api/ai/generate-sprite", () => {
    it("should return 400 when prompt is missing", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ folderId: testFolderId });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("Prompt is required");
    });

    it("should return 400 when prompt is empty", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ prompt: "   ", folderId: testFolderId });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 when prompt exceeds maximum length", async () => {
      const longPrompt = "a".repeat(301);
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ prompt: longPrompt, folderId: testFolderId });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain("maximum length");
    });

    it("should return 400 when folderId is missing", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ prompt: "a red potion" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain("folderId is required");
    });

    it("should return 400 when folder does not exist", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ prompt: "a red potion", folderId: 99999 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain("Folder not found");
    });

    it("should return 400 when palette is invalid", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({ prompt: "a red potion", folderId: testFolderId, palette: 128 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain("Invalid palette");
    });

    it("should return 201 and create file with valid request", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({
          prompt: "a small red potion bottle",
          folderId: testFolderId,
          palette: 32,
          removeBackground: true,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("file");
      expect(res.body).toHaveProperty("meta");
      
      // Check file properties
      expect(res.body.file).toHaveProperty("id");
      expect(res.body.file).toHaveProperty("name");
      expect(res.body.file).toHaveProperty("url");
      expect(res.body.file).toHaveProperty("folderId", testFolderId);
      expect(res.body.file.url).toMatch(/^\/uploads\//);
      
      // Check meta properties
      expect(res.body.meta).toHaveProperty("model");
      expect(res.body.meta).toHaveProperty("generatedAt");
      expect(res.body.meta).toHaveProperty("palette", 32);
      expect(res.body.meta).toHaveProperty("size", 64);
    });

    it("should create file on disk with valid request", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({
          prompt: "a blue gem",
          folderId: testFolderId,
          palette: 16,
        });

      expect(res.statusCode).toEqual(201);
      
      // Extract filename from URL
      const url = res.body.file.url;
      const filename = path.basename(url);
      const filePath = path.join(process.env.DATA_DIR, "uploads", filename);
      
      // Verify file exists on disk
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify it's a valid PNG by checking buffer
      const fileBuffer = fs.readFileSync(filePath);
      expect(fileBuffer.length).toBeGreaterThan(0);
      
      // PNG magic bytes
      expect(fileBuffer[0]).toBe(0x89);
      expect(fileBuffer[1]).toBe(0x50); // P
      expect(fileBuffer[2]).toBe(0x4e); // N
      expect(fileBuffer[3]).toBe(0x47); // G
    });

    it("should generate 64x64 pixel output", async () => {
      const sharp = require("sharp");
      
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({
          prompt: "a golden coin",
          folderId: testFolderId,
        });

      expect(res.statusCode).toEqual(201);
      
      const url = res.body.file.url;
      const filename = path.basename(url);
      const filePath = path.join(process.env.DATA_DIR, "uploads", filename);
      
      // Read image and verify dimensions
      const metadata = await sharp(filePath).metadata();
      expect(metadata.width).toBe(64);
      expect(metadata.height).toBe(64);
    });

    it("should accept custom fileName", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({
          prompt: "a sword",
          folderId: testFolderId,
          fileName: "my_custom_sword",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.file.name).toContain("my_custom_sword");
    });

    it("should accept optional seed parameter", async () => {
      const res = await request(app)
        .post("/api/ai/generate-sprite")
        .send({
          prompt: "a shield",
          folderId: testFolderId,
          seed: 12345,
        });

      expect(res.statusCode).toEqual(201);
    });
  });
});
