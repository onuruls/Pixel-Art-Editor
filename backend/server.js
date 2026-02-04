const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("./config");
const DbClient = require("./db/DbClient");

const app = express();
const db_client = new DbClient();

// Ensure data existence
if (!fs.existsSync(config.UPLOADS_DIR)) {
  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: "10mb" }));

// CORS setup
if (config.CORS_ORIGIN.length > 0) {
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
    })
  );
} else {
  // If no CORS origin specified, we assume same-origin usage (production style)
  // or that we rely on default same-origin policy if we were strict,
  // but to be safe for dev without config:
  app.use(cors()); 
}

// Serve API requests
const apiRouter = express.Router();

/**
 * Health Check
 */
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * Creates a new Project
 */
apiRouter.post("/projects", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  try {
    const project = await db_client.new_project(name);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Error creating project" });
  }
});

/**
 * Gets a list of all the projects
 */
apiRouter.get("/projects", async (req, res) => {
  try {
    const projects = await db_client.get_projects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Renames a project
 */
apiRouter.put("/projects/:id/rename", async (req, res) => {
  const project_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).json({ error: "New project name is required" });
  }

  try {
    await db_client.rename_project(project_id, new_name);
    res.status(200).json({ message: "Project renamed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Deletes a project
 */
apiRouter.delete("/projects/:id", async (req, res) => {
  const project_id = req.params.id;
  try {
    await db_client.delete_project(project_id);
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Gets a project and its root folder
 */
apiRouter.get("/projects/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const project = await db_client.get_project(id);
    res.status(200).json(project);
  } catch (err) {
    console.error("Failed loading project:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Gets a folder and its immediate children
 */
apiRouter.get("/folders/:id", async (req, res) => {
  const folder_id = req.params.id;
  try {
    const folder = await db_client.get_folder(folder_id);
    res.status(200).json(folder);
  } catch (err) {
    console.error("Failed loading folder:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Adds a new Folder to the parent folder
 */
apiRouter.post("/projects/folders", async (req, res) => {
  const { folder_id, folder_name } = req.body;

  if (!folder_id) {
    return res.status(400).json({ error: "Parent folder ID is required" });
  }

  try {
    const folder = await db_client.add_folder(folder_id, folder_name);
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error adding folder:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Deletes a folder by its ID
 */
apiRouter.delete("/folders/:id", async (req, res) => {
  const folder_id = req.params.id;
  try {
    await db_client.delete_folder(folder_id);
    res.status(200).json({ message: "Folder deleted" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Error deleting folder" });
  }
});

/**
 * Renames a folder by its ID
 */
apiRouter.put("/folders/:id/rename", async (req, res) => {
  const folder_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).json({ error: "New folder name is required" });
  }

  try {
    await db_client.rename_folder(folder_id, new_name);
    res.status(200).json({ message: "Folder renamed" });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({ error: "Error renaming folder" });
  }
});

/**
 * Moves a folder to a different parent folder
 */
apiRouter.put("/folders/move", async (req, res) => {
  const { folder_id, target_folder_id } = req.body;

  if (!folder_id || !target_folder_id) {
    return res.status(400).json({ error: "Folder ID and target folder ID are required" });
  }

  try {
    const updated_folder = await db_client.move_folder_to_folder(
      folder_id,
      target_folder_id
    );
    res.status(200).json(updated_folder);
  } catch (error) {
    console.error("Error moving folder:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Moves a file to a different folder
 */
apiRouter.put("/files/move", async (req, res) => {
  const { file_id, target_folder_id } = req.body;

  if (!file_id || !target_folder_id) {
    return res.status(400).json({ error: "File ID and target folder ID are required" });
  }

  try {
    const updated_file = await db_client.move_file_to_folder(
      file_id,
      target_folder_id
    );
    res.status(200).json(updated_file);
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Adds a new File to a folder
 */
apiRouter.post("/folders/:folder_id/files", async (req, res) => {
  const { name, type, data } = req.body;
  const folder_id = req.params.folder_id;

  if (!name) {
    return res.status(400).json({ error: "File name is required" });
  }

  const valid_types = ["png", "tmx"];
  if (!type || !valid_types.includes(type)) {
    return res
      .status(400)
      .json({ error: "Invalid file type. Only 'png' and 'tmx' are allowed." });
  }

  try {
    const file = await db_client.add_file(folder_id, name, type, data);
    res.status(201).json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Gets a file by its ID
 */
apiRouter.get("/files/:id", async (req, res) => {
  const file_id = req.params.id;

  try {
    const file = await db_client.get_file(file_id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Updates the content of an existing file (PNG).
 */
apiRouter.put("/files/:id", async (req, res) => {
  const file_id = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Matrix data is required to update the file" });
  }

  try {
    const file = await db_client.get_file(file_id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await db_client.write_file(file_id, content);
    res.status(200).json({ message: "File updated" });
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ error: "Error updating file" });
  }
});

/**
 * Renames a file by its ID
 */
apiRouter.put("/files/:id/rename", async (req, res) => {
  const file_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).json({ error: "New file name is required" });
  }

  try {
    await db_client.rename_file(file_id, new_name);
    res.status(200).json({ message: "File renamed" });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({ error: "Error renaming file" });
  }
});

/**
 * Deletes a file by its ID
 */
apiRouter.delete("/files/:id", async (req, res) => {
  const file_id = req.params.id;

  try {
    await db_client.delete_file(file_id);
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
});

/**
 * Endpoint to retrieve all PNG files from the uploads directory.
 */
apiRouter.get("/sprites", (req, res) => {
  fs.readdir(config.UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      // If uploads dir is empty/missing, just return empty list
      return res.status(200).json([]);
    }
    const png_files = files.filter((file) => path.extname(file) === ".png");
    res.status(200).json(png_files);
  });
});

apiRouter.put("/map_files/:id", async (req, res) => {
  const file_id = req.params.id;
  const data = req.body;
  try {
    await db_client.save_map_file(file_id, data);
    res.status(200).json({ message: "File saved" });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Error saving file" });
  }
});

// Mount API routes
// We mount on / but also /api for consistency if we wanted to migrate. 
// For now, to keep the frontend working perfectly without massive changes immediately, we keep root routes.
// But the plan says "Put API routes under /api". 
// To allow the current frontend to work WITHOUT modifying it yet (STEP 6 logic), 
// I should mount on BOTH or just root, but STEP 6 says I will update the frontend.
// So I will mount on /api AND root aliases? No, cleaner to just do /api and update frontend in Step 6.
// But wait, the frontend is currently hardcoded to localhost:3000/...
// I will mount on /api AND keep compatibility aliases OR config the frontend to use /api.
// Plan Phase 6 says "Replace all fetch... with /api...". 
// So I will mount everything on `/` for now to not break it before Step 6?
// Actually, I can just mount to BOTH to be safe during transition, or just do the frontend update immediately after.
// Let's mount to /api and / (legacy) to be safe?
// The plan says: "Put API routes under /api (recommended)... Optionally keep old routes"
// I will mount them on root matching current structure, AND on /api. 
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Serve uploads
app.use("/uploads", express.static(config.UPLOADS_DIR));

// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Default to serving index.html for unknown routes (SPA fallback if needed, or just let it be)
// The frontend structure is `frontend/EditorTool` etc. 
// The user currently accesses `frontend/EditorTool`. 
// If we serve `../frontend` at root, then `http://localhost:3000/EditorTool/` works.

const { initDB } = require("./db/db");

if (require.main === module) {
  initDB().then(() => {
    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
      console.log(`Data directory: ${config.DATA_DIR}`);
    });
  });
}

module.exports = app;

