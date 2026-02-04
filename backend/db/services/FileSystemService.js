const fs = require("fs");
const path = require("path");
const config = require("../../config");

class FileSystemService {
  /**
   * Service for handling file system operations
   */
  constructor() {
    this.base_dir = config.UPLOADS_DIR;
  }

  get_full_path(filename) {
    return path.join(this.base_dir, filename);
  }

  /**
   * Creates a directory if it does not exist
   */
  async create_directory_if_not_exists() {
    if (!fs.existsSync(this.base_dir)) {
      fs.mkdirSync(this.base_dir, { recursive: true });
    }
  }

  /**
   * Creates a new file in the file system
   * Returns the filename (relative path)
   */
  async create_file(name, type) {
    await this.create_directory_if_not_exists();
    // Sanitize name to prevent path traversal? 
    // Ideally we should but for now keeping it simple as we trust internal logic somewhat, 
    // but better to be safe. We will assume 'name' is just a filename stem.
    const filename = `${name}.${type}`;
    const file_path = this.get_full_path(filename);
    
    fs.writeFileSync(file_path, "");
    return filename;
  }

  /**
   * Deletes a file from the file system
   * Expects filename (relative)
   */
  async delete_file(filename) {
    const file_path = this.get_full_path(filename);
    if (fs.existsSync(file_path)) {
      await fs.promises.unlink(file_path);
    } 
    // If file doesn't exist, we can ignore or warn. 
    // For idempotency, ignoring is fine, but let's throw if needed to match old behavior logic? 
    // Old behavior threw "File not found".
    else {
      throw new Error("File not found on disk");
    }
  }

  /**
   * Renames a file in the file system
   * Expects filenames
   */
  async rename_file(old_filename, new_filename) {
    const old_path = this.get_full_path(old_filename);
    const new_path = this.get_full_path(new_filename);

    if (fs.existsSync(old_path)) {
      await fs.promises.rename(old_path, new_path);
    } else {
      throw new Error("File not found on disk");
    }
  }

  /**
   * Checks if a file exists in the file system
   */
  file_exists(filename) {
    return fs.existsSync(this.get_full_path(filename));
  }
}

module.exports = new FileSystemService();
