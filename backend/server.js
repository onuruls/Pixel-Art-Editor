const express = require("express");
const db = require("./db/db");
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
  console.log("Projectname:", name);

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
 * Gets a project and all of its folders and files
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
 * Updates a project CURRENTLY UNUSED
 */
app.put("/projects/:id", (req, res) => {
  res.status(501).send("Not implemented yet");
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

  console.log("Adding Folder");

  try {
    const folder = await db_client.add_folder(folder_id, folder_name);
    res.status(201).send(folder);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
