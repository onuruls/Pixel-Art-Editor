const { Folder, File } = require("../db");
const helper = require("../utils/helpers");

class FolderService {
  /**
   * Service for managing folder-related operations
   */
  async get_folder(id) {
    const folder = await Folder.findOne({
      where: { id },
      include: [{ model: Folder, as: "children" }, { model: File }],
    });

    if (!folder) throw new Error("Folder not found");

    return this.structure_folder_data(folder);
  }

  /**
   * Structures folder data including its children
   */
  structure_folder_data(folder) {
    const folder_data = {
      id: folder.id,
      name: folder.name,
      parent_folder_id: folder.parent_folder_id || null,
      children: [],
    };

    if (folder.children && folder.children.length > 0) {
      folder.children.forEach((child_folder) => {
        folder_data.children.push(this.structure_folder_data(child_folder));
      });
    }

    if (folder.Files && folder.Files.length > 0) {
      folder.Files.forEach((file) => {
        folder_data.children.push({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.filepath,
          folder_id: file.folder_id,
          matrix_data: file.matrix_data,
          data: file.data,
        });
      });
    }

    return folder_data;
  }

  /**
   * Adds a new folder to a parent folder
   */
  async add_folder(parent_folder_id, folder_name) {
    let existing_folder = await Folder.findOne({
      where: { name: folder_name, parent_folder_id },
    });

    if (existing_folder) {
      folder_name = await helper.generate_unique_name(
        parent_folder_id,
        folder_name,
        false
      );
    }

    const new_folder = await Folder.create({
      name: folder_name,
      parent_folder_id,
    });
    return new_folder;
  }

  /**
   * Deletes a folder by ID
   */
  async delete_folder(id) {
    await Folder.destroy({ where: { id } });
  }

  /**
   * Renames a folder by ID
   */
  async rename_folder(id, new_name) {
    const folder = await Folder.findByPk(id);
    if (!folder) {
      throw new Error("Folder not found");
    }

    const unique_name = await helper.generate_unique_name(
      folder.parent_folder_id,
      new_name,
      false
    );

    folder.name = unique_name;
    await folder.save();
  }

  /**
   * Moves a folder to a new parent folder
   */
  async move_folder_to_folder(folder_id, target_folder_id) {
    const folder = await Folder.findByPk(folder_id);
    if (!folder) {
      throw new Error("Folder not found");
    }

    const existing_folder = await Folder.findOne({
      where: { name: folder.name, parent_folder_id: target_folder_id },
    });

    if (existing_folder) {
      folder.name = await helper.generate_unique_name(
        target_folder_id,
        folder.name,
        false
      );
    }

    folder.parent_folder_id = target_folder_id;
    await folder.save();

    return folder;
  }
}

module.exports = new FolderService();
