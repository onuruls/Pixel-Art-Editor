const { Project, Folder, File } = require("./db");
const { sequelize } = require("./db");

class DbClient {
  /**
   * Handles all the db queries
   */
  constructor() {}

  /**
   * Fetches all projects
   */
  async get_projects() {
    try {
      return await Project.findAll();
    } catch (err) {
      console.error("Error fetching projects:", err);
      throw err;
    }
  }

  /**
   * Fetches a project by its ID and retrieves its structure with the root folder.
   * @param {Number} id
   */
  async get_project(id) {
    try {
      const project = await Project.findOne({
        where: { id },
        include: {
          model: Folder,
          as: "rootFolder",
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return {
        id: project.id,
        name: project.name,
        created_at: project.created_at,
        root_folder_id: project.rootFolder ? project.rootFolder.id : null,
        root_folder: {
          id: project.rootFolder.id,
          name: project.rootFolder.name,
          children: [],
        },
      };
    } catch (err) {
      console.error("Error fetching project:", err);
      throw err;
    }
  }

  /**
   * Fetches a folder by its ID and retrieves its immediate children.
   * @param {Number} id
   */
  async get_folder(id) {
    try {
      const folder = await Folder.findOne({
        where: { id },
        include: [
          {
            model: Folder,
            as: "children",
          },
          {
            model: File,
          },
        ],
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      return this.structure_folder_data(folder);
    } catch (err) {
      console.error("Error fetching folder:", err);
      throw err;
    }
  }

  /**
   * Structures the folder data into a nested format.
   * @param {Object} folder
   */
  structure_folder_data(folder) {
    const folderData = {
      id: folder.id,
      name: folder.name,
      children: [],
    };

    if (folder.children && folder.children.length > 0) {
      folder.children.forEach((childFolder) => {
        folderData.children.push({
          id: childFolder.id,
          name: childFolder.name,
          children: [],
        });
      });
    }

    if (folder.Files && folder.Files.length > 0) {
      folder.Files.forEach((file) => {
        folderData.children.push({
          id: file.id,
          name: file.name,
          type: file.type,
          folder_id: file.folder_id,
        });
      });
    }

    return folderData;
  }

  /**
   * Creates a new project with a root folder and subfolders.
   * @param {String} name
   */
  async new_project(name) {
    try {
      return await sequelize.transaction(async (t) => {
        const rootFolder = await Folder.create(
          { name: "Root" },
          { transaction: t }
        );
        const project = await Project.create(
          {
            name,
            root_folder_id: rootFolder.id,
          },
          { transaction: t }
        );

        await Folder.bulkCreate(
          [
            { name: "Maps", parent_folder_id: rootFolder.id },
            { name: "Sprites", parent_folder_id: rootFolder.id },
          ],
          { transaction: t }
        );

        return project;
      });
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    }
  }

  /**
   * Renames an existing project.
   * @param {Number} id
   * @param {String} new_name
   */
  async rename_project(id, new_name) {
    try {
      await Project.update({ name: new_name }, { where: { id } });
      console.log(`Project with ID ${id} renamed to ${new_name}.`);
    } catch (err) {
      console.error("Error renaming project:", err);
      throw err;
    }
  }

  /**
   * Deletes a project by its ID.
   * @param {Number} id
   */
  async delete_project(id) {
    try {
      await Project.destroy({ where: { id } });
      console.log(`Project with ID ${id} deleted.`);
    } catch (err) {
      console.error("Error deleting project:", err);
      throw err;
    }
  }

  /**
   * Generates a unique folder name within the same parent folder.
   * @param {Number} parent_folder_id
   * @param {String} folder_name
   * @returns {String}
   */
  async generate_unique_folder_name(parent_folder_id, folder_name) {
    let unique_name = folder_name;
    let counter = 1;
    let is_unique = false;

    while (!is_unique) {
      const existingFolder = await Folder.findOne({
        where: {
          name: unique_name,
          parent_folder_id: parent_folder_id,
        },
      });

      if (!existingFolder) {
        is_unique = true;
      } else {
        unique_name = `${folder_name} (${counter})`;
        counter++;
      }
    }

    return unique_name;
  }

  /**
   * Adds a new folder to a parent folder.
   * @param {Number} parent_folder_id
   * @param {String} [folder_name="New Folder"]
   */
  async add_folder(parent_folder_id, folder_name = "New Folder") {
    try {
      const unique_name = await this.generate_unique_folder_name(
        parent_folder_id,
        folder_name
      );

      const newFolder = await Folder.create({
        name: unique_name,
        parent_folder_id: parent_folder_id,
      });

      console.log(`New folder created with ID: ${newFolder.id}`);
      return newFolder;
    } catch (err) {
      console.error("Error creating folder:", err);
      throw err;
    }
  }

  /**
   * Moves items (folders/files) to a different folder, ensuring unique names for folders.
   * @param {Array<string>} item_ids
   * @param {string} folder_id
   * @returns {Promise<Object>}
   */
  async move_items_to_folder(item_ids, folder_id) {
    try {
      await sequelize.transaction(async (t) => {
        for (const item_id of item_ids) {
          // Prüfe, ob das zu verschiebende Item ein Ordner oder eine Datei ist
          let item = await Folder.findByPk(item_id, { transaction: t });
          if (item) {
            // Überprüfe, ob ein Ordner mit demselben Namen im Zielordner existiert
            const unique_name = await this.generate_unique_folder_name(
              folder_id,
              item.name
            );
            item.name = unique_name; // Stelle sicher, dass der Name eindeutig ist
            item.parent_folder_id = folder_id;
            await item.save({ transaction: t });
          } else {
            // Falls das Item eine Datei ist, wende dieselbe Logik an
            const file = await File.findByPk(item_id, { transaction: t });
            if (file) {
              const existingFile = await File.findOne({
                where: {
                  name: file.name,
                  folder_id: folder_id,
                },
                transaction: t,
              });

              if (existingFile) {
                // Wenn eine Datei mit demselben Namen existiert, generiere einen eindeutigen Namen
                file.name = await this.generate_unique_file_name(
                  folder_id,
                  file.name
                );
              }
              file.folder_id = folder_id;
              await file.save({ transaction: t });
            }
          }
        }
      });

      // Rückgabe des Zielordners mit den aktualisierten Items
      return await this.get_folder(folder_id);
    } catch (error) {
      console.error("Error moving items:", error);
      throw error;
    }
  }

  /**
   * Deletes a folder by its ID.
   * This will cascade delete all child folders and files
   * due to the onDelete: "CASCADE" setting.
   * @param {Number} folder_id
   */
  async delete_folder(folder_id) {
    try {
      await Folder.destroy({
        where: { id: folder_id },
      });
      console.log(`Folder with ID ${folder_id} deleted.`);
    } catch (err) {
      console.error("Error deleting folder:", err);
      throw err;
    }
  }

  /**
   * Renames an existing folder.
   * @param {Number} id
   * @param {String} new_name
   */
  async rename_folder(id, new_name) {
    try {
      const [updated] = await Folder.update(
        { name: new_name },
        { where: { id } }
      );

      if (!updated) {
        throw new Error("Folder not found");
      }

      console.log(`Folder with ID ${id} renamed to ${new_name}.`);
    } catch (err) {
      console.error("Error renaming folder:", err);
      throw err;
    }
  }
}

module.exports = DbClient;
