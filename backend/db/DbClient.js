const db = require("./db.js");

class DbClient {
  /**
   * Handles all the db queries
   */
  constructor() {}

  /**
   * Fetch
   * @returns {Promise}
   */
  get_projects() {
    return new Promise((res, rej) => {
      db.all(`SELECT * FROM projects`, (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  get_project(id) {
    return new Promise((res, rej) => {
      // Schritt 1: Projekt und Root-Ordner abrufen
      db.get(
        `SELECT projects.id AS project_id, projects.name AS project_name, projects.created_at, folders.id AS root_folder_id, folders.name AS root_folder_name
         FROM projects
         JOIN folders ON projects.root_folder_id = folders.id
         WHERE projects.id = ?`,
        [id],
        (err, project) => {
          // Schritt 2: Rekursive Abfrage für Ordner und Dateien
          db.all(
            `WITH RECURSIVE folder_hierarchy AS (
               SELECT id, name, folder_id
               FROM folders
               WHERE id = ?
               UNION ALL
               SELECT f.id, f.name, f.folder_id
               FROM folders f
               INNER JOIN folder_hierarchy fh ON f.folder_id = fh.id
             )
             SELECT fh.id AS folder_id, fh.name AS folder_name, fh.folder_id AS parent_folder_id,
                    fl.id AS file_id, fl.name AS file_name, fl.type AS file_type
             FROM folder_hierarchy fh
             LEFT JOIN files fl ON fh.id = fl.folder_id`,
            [project.root_folder_id],
            (err, rows) => {
              res(this.structure_project_data(project, rows));
            }
          );
        }
      );
    });
  }

  structure_project_data(project, rows) {
    const folderMap = {};
    const rootFolder = {
      id: project.root_folder_id,
      name: project.root_folder_name,
      children: [],
    };

    rows.forEach((row) => {
      if (!folderMap[row.folder_id]) {
        folderMap[row.folder_id] = {
          id: row.folder_id,
          name: row.folder_name,
          folder_id: row.parent_folder_id,
          children: [],
        };
      }
      if (row.file_id) {
        folderMap[row.folder_id].children.push({
          id: row.file_id,
          name: row.file_name,
          type: row.file_type,
          folder_id: row.folder_id,
        });
      }
    });

    Object.values(folderMap).forEach((folder) => {
      if (folder.id !== rootFolder.id) {
        const parentFolder = folderMap[folder.parent_folder_id] || rootFolder;
        parentFolder.children.push(folder);
      }
    });

    return {
      id: project.project_id,
      name: project.project_name,
      created_at: project.created_at,
      root_folder_id: project.root_folder_id,
      root_folder: rootFolder,
    };
  }

  new_project(name) {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      // Root-Folder
      db.run(
        `INSERT INTO folders (name, folder_id) VALUES (?, NULL)`,
        ["Root"],
        function (err) {
          if (err) {
            console.error("Error inserting root folder:", err);
            db.run("ROLLBACK");
            return;
          }
          const rootFolderId = this.lastID;

          // Project
          db.run(
            `INSERT INTO projects (name, created_at, root_folder_id) VALUES (?, ?, ?)`,
            [name, new Date().toISOString(), rootFolderId],
            function (err) {
              if (err) {
                console.error("Error inserting project:", err);
                db.run("ROLLBACK");
                return;
              }

              //Maps-Folder
              db.run(
                `INSERT INTO folders (name, folder_id) VALUES (?, ?)`,
                ["Maps", rootFolderId],
                function (err) {
                  if (err) {
                    console.error("Error inserting Maps folder:", err);
                    db.run("ROLLBACK");
                    return;
                  }
                }
              );
              // Sprites-Folder
              db.run(
                `INSERT INTO folders (name, folder_id) VALUES (?, ?)`,
                ["Sprites", rootFolderId],
                function (err) {
                  if (err) {
                    console.error("Error inserting Sprites folder:", err);
                    db.run("ROLLBACK");
                    return;
                  }
                }
              );

              console.log("Project and folders created successfully.");
            }
          );
        }
      );
      db.run("COMMIT");
    });
  }

  update_project(id) {}

  add_folder(parent_folder_id, folder_name = "New Folder") {
    return new Promise((res, rej) => {
      // Führe die SQL-Anweisung aus
      db.run(
        `INSERT INTO folders (name, folder_id) VALUES (?, ?)`,
        [folder_name, parent_folder_id],
        function (err) {
          if (err) {
            console.error("Error inserting folder:", err);
            rej(err);
          } else {
            const new_folder_id = this.lastID;
            console.log(`New folder created with ID: ${new_folder_id}`);
            res({
              id: new_folder_id,
              name: folder_name,
              folder_id: parent_folder_id,
            });
          }
        }
      );
    });
  }

  update_folder(id) {}

  update_file(id) {}
}

module.exports = DbClient;
