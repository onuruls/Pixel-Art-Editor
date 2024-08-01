const express = require("express");
const db = require("./db");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.post("/projects", (req, res) => {
  const { name } = req.body;

  console.log("Creating new project");
  console.log("Projectname:", name);
  console.log("Root folder name:", name);

  const new_project = {
    name: name,
    created_at: new Date(),
    root_folder: {
      name: name || "root",
      type: "folder",
      children: [],
    },
  };

  db.insert(new_project, (err, new_doc) => {
    if (err) {
      return res.status(500).send("Error creating new project");
    }
    res.status(201).json(new_doc);
  });
});

app.get("/projects", (req, res) => {
  console.log("Loading all projects");

  db.find({}, (err, projects) => {
    if (err) {
      return res.status(500).send("Error loading project list");
    }
    res.status(200).send(projects);
  });
});

app.get("/projects/:id", (req, res) => {
  const id = req.params.id;

  console.log("Loading existing project:");
  console.log("Project-ID:", id);

  db.findOne({ _id: id }, (err, project) => {
    if (err) {
      return res.status(500).send("Error loading existing project");
    }
    if (!project) {
      return res.status(404).send("Project not found");
    }
    res.send(200).json(project);
  });
});

app.listen(3000, () => {
  console.log("Server is running");
});
