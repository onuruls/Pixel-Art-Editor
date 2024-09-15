const fs = require("fs");
const path = require("path");

class FileSystemService {
  constructor(base_dir) {
    this.base_dir = base_dir || path.resolve(__dirname, "../uploads");
  }

  async create_directory_if_not_exists() {
    if (!fs.existsSync(this.base_dir)) {
      fs.mkdirSync(this.base_dir, { recursive: true });
    }
  }

  async create_file(name, type) {
    await this.create_directory_if_not_exists();
    const file_path = path.join(this.base_dir, `${name}.${type}`);
    fs.writeFileSync(file_path, "");
    return file_path;
  }

  async delete_file(file_path) {
    if (fs.existsSync(file_path)) {
      await fs.promises.unlink(file_path);
    } else {
      throw new Error("File not found");
    }
  }

  async rename_file(old_file_path, new_file_path) {
    if (fs.existsSync(old_file_path)) {
      await fs.promises.rename(old_file_path, new_file_path);
    } else {
      throw new Error("File not found");
    }
  }

  file_exists(file_path) {
    return fs.existsSync(file_path);
  }
}

module.exports = new FileSystemService();
