const request = require("supertest");
const path = require("path");
const fs = require("fs");

// Set env before requiring app to ensure config picks it up
process.env.PORT = 3001; 
process.env.DATA_DIR = path.resolve(__dirname, "../.data_test");
process.env.DB_PATH = path.join(process.env.DATA_DIR, "test_db.sqlite");

// Ensure clean slate
if (fs.existsSync(process.env.DATA_DIR)) {
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
}

const app = require("../server");
const { sequelize } = require("../db/db");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
  // Clean up
  if (fs.existsSync(process.env.DATA_DIR)) {
     fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
});

describe("API Endpoints", () => {
  it("GET /health should return status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  let projectId;

  it("POST /projects should create a project", async () => {
    const res = await request(app)
      .post("/projects")
      .send({ name: "Test Project" });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Test Project");
    projectId = res.body.id;
  });

  it("GET /projects should list projects", async () => {
    const res = await request(app).get("/projects");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /projects/:id should return project details", async () => {
    const res = await request(app).get(`/projects/${projectId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", projectId);
  });
});
