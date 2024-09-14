const express = require("express");
const cors = require("cors");
const DbClient = require("./db/DbClient");
const db_client = new DbClient();
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

/**
 * Creates a new Project
 */
app.post("/projects", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send("Project name is required");
  }

  try {
    const project = await db_client.new_project(name);
    res.status(201).send(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send("Error creating project");
  }
});

/**
 * Gets a list of all the projects
 */
app.get("/projects", async (req, res) => {
  try {
    const projects = await db_client.get_projects();
    res.status(200).send(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
    res.status(500).send(error);
  }
});

/**
 * Renames a project
 */
app.put("/projects/:id/rename", async (req, res) => {
  const project_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).send("New project name is required");
  }

  console.log("Renaming project with ID:", project_id);

  try {
    await db_client.rename_project(project_id, new_name);
    res.status(200).send("Project renamed");
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Deletes a project
 */
app.delete("/projects/:id", async (req, res) => {
  const project_id = req.params.id;
  console.log("Deleting project with ID:", project_id);

  try {
    await db_client.delete_project(project_id);
    res.status(200).send("Project deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Gets a project and its root folder
 */
app.get("/projects/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const project = await db_client.get_project(id);
    res.status(200).send(project);
  } catch (err) {
    console.error("Failed loading project:", err);
    res.status(500).send(err);
  }
});

/**
 * Gets a folder and its immediate children
 */
app.get("/folders/:id", async (req, res) => {
  const folder_id = req.params.id;

  try {
    const folder = await db_client.get_folder(folder_id);
    res.status(200).send(folder);
  } catch (err) {
    console.error("Failed loading folder:", err);
    res.status(500).send(err);
  }
});

/**
 * Adds a new Folder to the parent folder
 */
app.post("/projects/folders", async (req, res) => {
  const { folder_id, folder_name } = req.body;

  if (!folder_id) {
    return res.status(400).send("Parent folder ID is required");
  }

  try {
    const folder = await db_client.add_folder(folder_id, folder_name);
    res.status(201).send(folder);
  } catch (error) {
    console.error("Error adding folder:", error);
    res.status(500).send(error);
  }
});

/**
 * Deletes a folder by its ID
 */
app.delete("/folders/:id", async (req, res) => {
  const folder_id = req.params.id;

  try {
    await db_client.delete_folder(folder_id);
    res.status(200).send("Folder deleted");
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).send("Error deleting folder");
  }
});

/**
 * Renames a folder by its ID
 */
app.put("/folders/:id/rename", async (req, res) => {
  const folder_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).send("New folder name is required");
  }

  try {
    await db_client.rename_folder(folder_id, new_name);
    res.status(200).send("Folder renamed");
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).send("Error renaming folder");
  }
});

/**
 * Moves a folder to a different parent folder
 */
app.put("/folders/move", async (req, res) => {
  const { folder_id, target_folder_id } = req.body;

  if (!folder_id || !target_folder_id) {
    return res.status(400).send("Folder ID and target folder ID are required");
  }

  try {
    const updated_folder = await db_client.move_folder_to_folder(
      folder_id,
      target_folder_id
    );
    res.status(200).send(updated_folder);
  } catch (error) {
    console.error("Error moving folder:", error);
    res.status(500).send(error);
  }
});

/**
 * Moves a file to a different folder
 */
app.put("/files/move", async (req, res) => {
  const { file_id, target_folder_id } = req.body;

  if (!file_id || !target_folder_id) {
    return res.status(400).send("File ID and target folder ID are required");
  }

  try {
    const updated_file = await db_client.move_file_to_folder(
      file_id,
      target_folder_id
    );
    res.status(200).send(updated_file);
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).send(error);
  }
});

/**
 * Adds a new File to a folder with a dummy file
 */
app.post("/folders/:folder_id/files", async (req, res) => {
  const { name, type } = req.body;
  const folder_id = req.params.folder_id;

  if (!name) {
    return res.status(400).send("File name is required");
  }

  const validTypes = ["png", "tmx"];
  if (!type || !validTypes.includes(type)) {
    return res
      .status(400)
      .send("Invalid file type. Only 'png' and 'tmx' are allowed.");
  }

  try {
    // Zuerst wird der Dateieintrag in der Datenbank erstellt
    const file = await db_client.add_file(folder_id, name, type);

    // Danach wird die Datei im Dateisystem erstellt
    const dummyContent =
      type === "png" ? "Dummy PNG content" : "Dummy TMX content";
    fs.writeFileSync(file.filepath, dummyContent);

    res.status(201).send(file);
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).send(error);
  }
});

/**
 * Gets a file by its ID
 */
app.get("/files/:id", async (req, res) => {
  const file_id = req.params.id;

  try {
    const file = await db_client.get_file(file_id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.status(200).send(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send(error);
  }
});

/**
 * Serves the file content by file ID
 */
app.get("/files/:id/content", async (req, res) => {
  const file_id = req.params.id;

  try {
    const file = await db_client.get_file(file_id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.sendFile(file.filepath);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send(error);
  }
});

/**
 * Renames a file by its ID
 */
app.put("/files/:id/rename", async (req, res) => {
  const file_id = req.params.id;
  const { new_name } = req.body;

  if (!new_name) {
    return res.status(400).send("New file name is required");
  }

  try {
    await db_client.rename_file(file_id, new_name);
    res.status(200).send("File renamed");
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).send("Error renaming file");
  }
});

/**
 * Deletes a file by its ID
 */
app.delete("/files/:id", async (req, res) => {
  const file_id = req.params.id;

  try {
    await db_client.delete_file(file_id);
    res.status(200).send("File deleted");
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
