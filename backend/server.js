const express = require("express");
const db = require("./db/db");
const cors = require("cors");
const app = express();
const DbClient = require("./db/DbClient");
const db_client = new DbClient();

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
app.post("/projects", (req, res) => {
  const { name } = req.body;

  console.log("Creating new project");
  console.log("Projectname:", name);
  console.log("Root folder name:", name);
  db_client.new_project(name);
});

/**
 * Gets a list of all the projects
 */
app.get("/projects", (req, res) => {
  db_client
    .get_projects()
    .then((projects) => {
      console.log(`Loading Projects: ${projects}`);
      res.status(200).send(projects);
    })
    .catch((error) => {
      console.log(`Error loading projects: ${projects}`);
      res.status(500).send(error);
    });
});

/**
 * Gets a project and all of its folders and files
 */
app.get("/projects/:id", (req, res) => {
  const id = req.params.id;
  console.log("Loading existing project:");
  console.log("Project-ID:", id);
  db_client
    .get_project(id)
    .then((project) => {
      console.log(`Loaded project: ${project}`);
      res.status(200).send(project);
    })
    .catch((err) => {
      console.log(`Failed loading project: ${err}`);
      res.status(500).send(err);
    });
});

/**
 * Updates a project CURRENTLY UNUSED
 */
app.put("/projects/:id", (req, res) => {
  const project_id = req.params.id;
  const project = req.body;
  console.log("Updating project with ID:", project_id);
});

/**
 * Renames a project
 */
app.put("/projects/:id/rename", (req, res) => {
  const project_id = req.params.id;
  const { new_name } = req.body;
  console.log("Renaming project with ID:", project_id);
  db_client
    .rename_project(project_id, new_name)
    .then(() => {
      res.status(200).send("Project renamed");
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

/**
 * Deletes a project
 */
app.delete("/projects/:id", (req, res) => {
  const project_id = req.params.id;
  console.log("Deleting project with ID:", project_id);
  db_client
    .delete_project(project_id)
    .then(() => {
      res.status(200).send("Project deleted");
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

/**
 * Adds a new Folder to the parent_folder
 */
app.post("/projects/folders", (req, res) => {
  const { folder_id } = req.body;
  console.log("Adding Folder");
  db_client
    .add_folder(folder_id)
    .then((folder) => {
      res.status(200).send(folder);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.listen(3000, () => {
  console.log("Server is running");
});
