const { Project, Folder } = require("../db");
const { sequelize } = require("../db");

class ProjectService {
  async get_projects() {
    return await Project.findAll();
  }

  async get_project_by_id(id) {
    const project = await Project.findOne({
      where: { id },
      include: { model: Folder, as: "rootFolder" },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return {
      id: project.id,
      name: project.name,
      created_at: project.createdAt,
      root_folder_id: project.rootFolder?.id || null,
      root_folder: {
        id: project.rootFolder.id,
        name: project.rootFolder.name,
        children: [],
      },
    };
  }

  async create_project(name) {
    return await sequelize.transaction(async (t) => {
      const root_folder = await Folder.create(
        { name: "Root" },
        { transaction: t }
      );
      const project = await Project.create(
        { name, root_folder_id: root_folder.id },
        { transaction: t }
      );

      await Folder.bulkCreate(
        [
          { name: "Maps", parent_folder_id: root_folder.id },
          { name: "Sprites", parent_folder_id: root_folder.id },
        ],
        { transaction: t }
      );

      return project;
    });
  }

  async rename_project(id, new_name) {
    await Project.update({ name: new_name }, { where: { id } });
  }

  async delete_project(id) {
    await Project.destroy({ where: { id } });
  }
}

module.exports = new ProjectService();
