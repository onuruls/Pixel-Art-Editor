const { Project, Folder, File } = require("./db");
const { sequelize } = require("./db");

class DbClient {
  /**
   * Handles all the db queries
   */
  constructor() {}

  /**
   * Fetches all projects
   * @returns {Promise<Array<Object>>}
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
   * Fetches a project by its ID and retrieves its structure with all folders and files.
   * @param {Number} id
   * @returns {Promise<Object>}
   */
  async get_project(id) {
    try {
      const project = await Project.findOne({
        where: { id },
        include: {
          model: Folder,
          as: "rootFolder",
          include: [
            {
              model: Folder,
              as: "children",
              include: [File],
            },
          ],
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return this.structure_project_data(project);
    } catch (err) {
      console.error("Error fetching project:", err);
      throw err;
    }
  }

  /**
   * Structures the project data into a nested format.
   * @param {Object} project
   * @returns {Object}
   */
  structure_project_data(project) {
    const folderMap = {};
    const rootFolder = {
      id: project.rootFolder.id,
      name: project.rootFolder.name,
      children: [],
    };

    project.rootFolder.children.forEach((folder) => {
      if (!folderMap[folder.id]) {
        folderMap[folder.id] = {
          id: folder.id,
          name: folder.name,
          folder_id: folder.folder_id,
          children: [],
        };
      }

      folder.Files.forEach((file) => {
        folderMap[folder.id].children.push({
          id: file.id,
          name: file.name,
          type: file.type,
          folder_id: file.folder_id,
        });
      });
    });

    Object.values(folderMap).forEach((folder) => {
      if (folder.folder_id) {
        const parentFolder = folderMap[folder.folder_id] || rootFolder;
        parentFolder.children.push(folder);
      } else {
        rootFolder.children.push(folder);
      }
    });

    return {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      root_folder_id: project.rootFolder.id,
      root_folder: rootFolder,
    };
  }

  /**
   * Creates a new project with a root folder and subfolders.
   * @param {String} name
   * @returns {Promise<Object>}
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
            { name: "Maps", folder_id: rootFolder.id },
            { name: "Sprites", folder_id: rootFolder.id },
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
   * @returns {Promise<void>}
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
   * @returns {Promise<void>}
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
   * @returns {Promise<Object>}
   */
  async add_folder(parent_folder_id, folder_name = "New Folder") {
    try {
      const newFolder = await Folder.create({
        name: folder_name,
        folder_id: parent_folder_id,
      });
      console.log(`New folder created with ID: ${newFolder.id}`);
      return newFolder;
    } catch (err) {
      console.error("Error creating folder:", err);
      throw err;
    }
  }
}

module.exports = DbClient;
