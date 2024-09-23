const { File } = require("../db");
const fs = require("fs");
const { PNG } = require("pngjs");
const file_system_service = require("./FileSystemService");
const helper = require("../utils/helpers");
const path = require("path");
const { Op } = require("sequelize");

class FileService {
  /**
   * Service for managing file-related operations
   * @param {Number} folder_id
   * @param {String} name
   * @param {String} type
   * @param {JSON} data
   * @returns {Promise<File>}
   */
  async add_file(folder_id, name, type, data) {
    if (!["png", "tmx"].includes(type)) {
      throw new Error("Invalid file type. Only 'png' and 'tmx' are allowed.");
    }

    let existing_file = await File.findOne({
      where: { name, folder_id, type },
    });

    if (existing_file) {
      name = await helper.generate_unique_name(folder_id, name, true, type);
    }

    if (!data) {
      const default_matrix = Array.from({ length: 64 }, () =>
        Array(64).fill([0, 0, 0, 0])
      );
      switch (type) {
        case "png":
          data = {
            frames: [{ matrix: default_matrix }],
            palette: Array(6).fill("#A4A5A6"),
            selectedColor: "#000000",
            secondaryColor: "#FFFFFF",
          };
          break;
        case "tmx":
          data = { layers: [{ matrix: default_matrix }] };
          break;
      }
    }

    const file_path = await file_system_service.create_file(name, type);

    if (type === "png") {
      const matrix_preview = data.frames[0].matrix;
      const png = this.generate_png(matrix_preview);
      png.pack().pipe(fs.createWriteStream(file_path));
    } else if (type === "tmx") {
      const dummyContent = JSON.stringify(data);
      fs.writeFileSync(file_path, dummyContent);
    }

    const new_file = await File.create({
      name,
      type,
      filepath: file_path,
      data,
      folder_id,
    });

    return new_file;
  }

  /**
   * Service to retrieve a file by its ID
   * @param {number} id
   * @returns {Promise<File>}
   */
  async get_file(id) {
    const file = await File.findByPk(id);
    if (!file) {
      throw new Error("File not found");
    }
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      folder_id: file.folder_id,
      url: file.filepath,
      data: file.data,
    };
  }

  /**
   * Updates the file's data and rewrites the PNG file on disk.
   * @param {Number} file_id
   * @param {JSON} data
   * @returns {Promise<void>}
   */
  async write_file(file_id, data) {
    const file = await File.findByPk(file_id);
    if (!file) {
      throw new Error("File not found");
    }

    if (file.type === "png" && data) {
      const preview_matrix = data.frames[0].matrix;
      const png = this.generate_png(preview_matrix);
      png.pack().pipe(fs.createWriteStream(file.filepath));
    } else {
      throw new Error("Unsupported file type");
    }

    file.data = data;

    await file.save();
  }

  /**
   * Service to delete a file and its record
   * @param {number} id
   */
  async delete_file(id) {
    const file = await File.findByPk(id);
    if (file) {
      await file_system_service.delete_file(file.filepath);
      await file.destroy();
    }
  }

  /**
   * Service to rename a file and update its filepath
   * @param {number} id
   * @param {string} new_name
   */
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

  /**
   * Service to move a file to a new folder
   * @param {number} file_id
   * @param {number} target_folder_id
   * @returns {Promise<File>}
   */
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

  /**
   * Service to generate a PNG image from matrix data
   * @param {Array<Array<string>>} matrix_data
   * @returns {PNG}
   */
  generate_png(matrix_data) {
    const png = new PNG({ width: 64, height: 64 });
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = (64 * y + x) << 2;
        const pixel = matrix_data[y][x];
        png.data[idx] = pixel[0];
        png.data[idx + 1] = pixel[1];
        png.data[idx + 2] = pixel[2];
        png.data[idx + 3] = pixel[3];
      }
    }
    return png;
  }

  /**
   * Updates MapEditor-File after changes
   * @param {*} file_id
   * @param {*} matrix_data
   */
  async save_map_file(file_id, matrix_data) {
    const file = await File.findByPk(file_id);
    if (!file) throw new Error("File not found");
    file.matrix_data = matrix_data;
    file.save();
  }
}

module.exports = new FileService();
