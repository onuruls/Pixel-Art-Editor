const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
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
   * Sanitize file extension to only allow safe characters
   */
  sanitize_extension(type) {
    return type.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  }

  /**
   * Creates a new file in the file system
   * Returns the stored filename (UUID-based for safety)
   */
  async create_file(name, type) {
    await this.create_directory_if_not_exists();
    const safeExt = this.sanitize_extension(type);
    const storedFilename = `${randomUUID()}.${safeExt}`;
    const file_path = this.get_full_path(storedFilename);
    
    fs.writeFileSync(file_path, "");
    return storedFilename;
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
