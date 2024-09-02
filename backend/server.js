const express = require("express");
const cors = require("cors");
const DbClient = require("./db/DbClient");
const db_client = new DbClient();

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

  console.log("Creating new project");
  console.log("Project name:", name);

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
    console.log(`Loading Projects: ${projects}`);
    res.status(200).send(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
    res.status(500).send(error);
  }
});

/**
 * Gets a project and its root folder
 */
app.get("/projects/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Loading existing project:", id);

  try {
    const project = await db_client.get_project(id);
    console.log(`Loaded project: ${project}`);
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
  console.log("Loading folder with ID:", folder_id);

  try {
    const folder = await db_client.get_folder(folder_id);
    console.log(`Loaded folder: ${folder}`);
    res.status(200).send(folder);
  } catch (err) {
    console.error("Failed loading folder:", err);
    res.status(500).send(err);
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
 * Adds a new Folder to the parent_folder
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
  console.log("Deleting folder with ID:", folder_id);

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
 * Moves folders/files to a different parent folder
 */
app.put("/folders/move", async (req, res) => {
  const { item_ids, folder_id } = req.body;

  if (!item_ids || !folder_id) {
    return res.status(400).send("Item IDs and target folder ID are required");
  }

  try {
    const updated_folder = await db_client.move_items_to_folder(
      item_ids,
      folder_id
    );
    res.status(200).send(updated_folder);
  } catch (error) {
    console.error("Error moving items:", error);
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
