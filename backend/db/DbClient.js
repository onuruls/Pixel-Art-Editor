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
   * Adds a new folder to a parent folder.
   * @param {Number} parent_folder_id
   * @param {String} [folder_name="New Folder"]
   */
  async add_folder(parent_folder_id, folder_name = "New Folder") {
    try {
      const newFolder = await Folder.create({
        name: folder_name,
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
