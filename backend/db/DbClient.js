const { Project, Folder, File } = require("./db");
const { sequelize } = require("./db");

class DbClient {
  constructor() {}

  async get_projects() {
    try {
      return await Project.findAll();
    } catch (err) {
      console.error("Error fetching projects:", err);
      throw err;
    }
  }

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

  structure_folder_data(folder) {
    const folderData = {
      id: folder.id,
      name: folder.name,
      parent_folder_id: folder.parent_folder_id || null,
      children: [],
    };

    if (folder.children && folder.children.length > 0) {
      folder.children.forEach((childFolder) => {
        folderData.children.push(this.structure_folder_data(childFolder));
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

  async move_folder_to_folder(folder_id, target_folder_id) {
    try {
      const folder = await Folder.findByPk(folder_id);

      if (!folder) {
        throw new Error("Folder not found");
      }

      const existingFolder = await Folder.findOne({
        where: {
          name: folder.name,
          parent_folder_id: target_folder_id,
        },
      });

      if (existingFolder) {
        folder.name = await this.generate_unique_folder_name(
          target_folder_id,
          folder.name
        );
      }

      folder.parent_folder_id = target_folder_id;
      await folder.save();

      return folder;
    } catch (err) {
      console.error("Error moving folder:", err);
      throw err;
    }
  }

  async move_file_to_folder(file_id, target_folder_id) {
    try {
      const file = await File.findByPk(file_id);

      if (!file) {
        throw new Error("File not found");
      }

      const existingFile = await File.findOne({
        where: {
          name: file.name,
          folder_id: target_folder_id,
        },
      });

      if (existingFile) {
        file.name = await this.generate_unique_file_name(
          target_folder_id,
          file.name
        );
      }

      file.folder_id = target_folder_id;
      await file.save();

      return file;
    } catch (err) {
      console.error("Error moving file:", err);
      throw err;
    }
  }

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

  async generate_unique_file_name(folder_id, file_name) {
    let unique_name = file_name;
    let counter = 1;
    let is_unique = false;

    while (!is_unique) {
      const existingFile = await File.findOne({
        where: {
          name: unique_name,
          folder_id: folder_id,
        },
      });

      if (!existingFile) {
        is_unique = true;
      } else {
        unique_name = `${file_name} (${counter})`;
        counter++;
      }
    }

    return unique_name;
  }

  async add_folder(parent_folder_id, folder_name) {
    try {
      let existingFolder = await Folder.findOne({
        where: {
          name: folder_name,
          parent_folder_id: parent_folder_id,
        },
      });

      if (existingFolder) {
        folder_name = await this.generate_unique_folder_name(
          parent_folder_id,
          folder_name
        );
      }
      const new_folder = await Folder.create({
        name: folder_name,
        parent_folder_id: parent_folder_id,
      });

      return new_folder;
    } catch (err) {
      console.error("Error adding folder:", err);
      throw err;
    }
  }

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

  async add_file(folder_id, name, type = "file") {
    try {
      let existingFile = await File.findOne({
        where: {
          name: name,
          folder_id: folder_id,
        },
      });

      if (existingFile) {
        name = await this.generate_unique_file_name(folder_id, name);
      }
      const new_file = await File.create({
        name,
        type,
        folder_id,
      });

      return new_file;
    } catch (err) {
      console.error("Error creating file:", err);
      throw err;
    }
  }

  async get_file(id) {
    try {
      return await File.findByPk(id);
    } catch (err) {
      console.error("Error fetching file:", err);
      throw err;
    }
  }

  async rename_file(id, new_name) {
    try {
      await File.update({ name: new_name }, { where: { id } });
    } catch (err) {
      console.error("Error renaming file:", err);
      throw err;
    }
  }

  async delete_file(id) {
    try {
      await File.destroy({ where: { id } });
    } catch (err) {
      console.error("Error deleting file:", err);
      throw err;
    }
  }
}

module.exports = DbClient;
