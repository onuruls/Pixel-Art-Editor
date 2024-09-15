const { File } = require("../db");
const file_system_service = require("./FileSystemService");
const helper = require("../utils/helpers");
const path = require("path");
const { Op } = require("sequelize");

class FileService {
  async add_file(folder_id, name, type) {
    if (!["png", "tmx"].includes(type)) {
      throw new Error("Invalid file type. Only 'png' and 'tmx' are allowed.");
    }

    let existing_file = await File.findOne({
      where: { name, folder_id, type },
    });

    if (existing_file) {
      name = await helper.generate_unique_name(folder_id, name, true, type);
    }

    const file_path = await file_system_service.create_file(name, type);

    const new_file = await File.create({
      name,
      type,
      filepath: file_path,
      folder_id,
    });

    return new_file;
  }

  async delete_file(id) {
    const file = await File.findByPk(id);
    if (file) {
      await file_system_service.delete_file(file.filepath);
      await file.destroy();
    }
  }

  async rename_file(id, new_name) {
    const file = await File.findByPk(id);
    if (!file) {
      throw new Error("File not found");
    }

    const existing_file = await File.findOne({
      where: {
        name: new_name,
        type: file.type,
        folder_id: file.folder_id,
        id: { [Op.ne]: id },
      },
    });

    if (existing_file) {
      new_name = await helper.generate_unique_name(
        file.folder_id,
        new_name,
        true,
        file.type
      );
    }

    const old_file_path = file.filepath;
    const ext = path.extname(old_file_path);
    const new_file_path = path.join(
      path.dirname(old_file_path),
      new_name + ext
    );
    await file_system_service.rename_file(old_file_path, new_file_path);

    file.name = new_name;
    file.filepath = new_file_path;
    await file.save();
  }

  async move_file_to_folder(file_id, target_folder_id) {
    const file = await File.findByPk(file_id);

    if (!file) throw new Error("File not found");

    const existing_file = await File.findOne({
      where: { name: file.name, type: file.type, folder_id: target_folder_id },
    });

    if (existing_file) {
      file.name = await helper.generate_unique_name(
        target_folder_id,
        file.name,
        true,
        file.type
      );
    }

    file.folder_id = target_folder_id;
    await file.save();

    return file;
  }
}

module.exports = new FileService();
