import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";

export class FileSystemHandler {
  constructor(file_area_view, project) {
    this.file_area_view = file_area_view;
    this.file_area_view.file_system_handler = this;
    this.project = project;
    this.active_folder = project.root_folder;
    this.entries = this.normalize_entries(this.active_folder.children);
    this.folder_history = [this.active_folder];
  }

  /**
   * Normalizes entries to Folder or File instances.
   * @param {Array<Object>} entries
   * @returns {Array<Folder|File>}
   */
  normalize_entries(entries) {
    return entries.map((entry) => this.normalize_entry(entry));
  }

  /**
   * Converts an entry object to either Folder or File instance.
   * @param {Object} entry
   * @returns {Folder|File}
   */
  normalize_entry(entry) {
    if (entry instanceof Folder || entry instanceof File) {
      return entry;
    }

    if (entry.children) {
      const folder = new Folder(entry.id, entry.name, entry.parent_folder_id);
      folder.children = this.normalize_entries(entry.children || []);
      return folder;
    } else if (entry.type === "file") {
      // Anpassung: URL des Files im Frontend speichern
      return new File(
        entry.id,
        entry.name,
        entry.folder_id,
        entry.type,
        entry.url
      );
    } else {
      console.error("Unknown entry type", entry);
    }
  }

  /**
   * Finds a folder by its ID.
   * @param {number} folder_id
   * @returns {Folder|null}
   */
  get_folder_by_id(folder_id) {
    return (
      this.entries.find(
        (entry) => entry instanceof Folder && entry.id === folder_id
      ) || null
    );
  }

  /**
   * Finds a file by its ID.
   * @param {number} file_id
   * @returns {File|null}
   */
  get_file_by_id(file_id) {
    return (
      this.entries.find(
        (entry) => entry instanceof File && entry.id === file_id
      ) || null
    );
  }

  /**
   * Fetches data from the API.
   * @param {string} url
   * @param {Object} [options={}]
   * @returns {Promise<Object>}
   */
  async fetch_api(url, options = {}) {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("Content-Type");

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reads and updates the directory content.
   */
  async read_directory_content() {
    if (!this.active_folder || !this.active_folder.children) {
      console.error("Active folder is not defined or has no children.");
      return;
    }

    try {
      const folder_data = await this.fetch_api(
        `http://localhost:3000/folders/${this.active_folder.id}`
      );

      this.active_folder.build_folder_structure(folder_data.children);
      this.entries = this.normalize_entries(this.active_folder.children);
      this.file_area_view.rebuild_view();
    } catch (error) {
      console.error("Error loading folder content:", error);
    }
  }

  change_directory_handle(folder_identifier) {
    console.log("Navigating to:", folder_identifier);
    console.log("Current folder history:", this.folder_history);

    if (folder_identifier === -1) {
      this.load_prev_directory();
    } else {
      console.log("Folder identifier is a number:", folder_identifier);
      this.load_new_directory_by_id(folder_identifier);
    }
  }

  /**
   * Loads the previous directory based on the folder history.
   */
  load_prev_directory() {
    if (this.folder_history.length > 1) {
      this.folder_history.pop();
      const previousFolder =
        this.folder_history[this.folder_history.length - 1];
      this.active_folder = previousFolder;
      console.log("Navigating to previous folder:", previousFolder);
      this.read_directory_content();
    } else {
      console.warn("No previous directory in history.");
    }
  }

  /**
   * Returns the parent folder ID of the current folder.
   * @returns {number|null}
   */
  get_parent_folder_id() {
    if (this.folder_history.length > 1) {
      return this.folder_history[this.folder_history.length - 2].id;
    }
    return this.active_folder.parent_folder_id || null;
  }

  /**
   * Loads a new directory based on folder ID.
   * @param {number} folder_id
   */
  load_new_directory_by_id(folder_id) {
    const folder_to_load = this.get_folder_by_id(folder_id);

    if (!folder_to_load) {
      console.error(`Folder with ID ${folder_id} not found.`);
      return;
    }

    this.active_folder = folder_to_load;
    this.folder_history.push(this.active_folder);
    this.read_directory_content();
  }

  /**
   * Creates a new folder.
   * @param {string} folderName
   */
  async create_folder(folderName) {
    try {
      const new_folder = await this.fetch_api(
        "http://localhost:3000/projects/folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folder_id: this.active_folder.id,
            folder_name: folderName,
          }),
        }
      );

      this.active_folder.children.push(
        new Folder(new_folder.id, new_folder.name, new_folder.parent_folder_id)
      );
      this.read_directory_content();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }

  /**
   * Renames a folder by its ID.
   * @param {number} id
   * @param {string} newName
   */
  async rename_folder_by_id(id, newName) {
    try {
      await this.fetch_api(`http://localhost:3000/folders/${id}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_name: newName }),
      });

      const folder = this.get_folder_by_id(id);
      if (folder) folder.name = newName;
      this.read_directory_content();
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  }

  /**
   * Deletes a folder by its ID.
   * @param {number} folderId
   */
  async delete_folder_by_id(folderId) {
    try {
      await this.fetch_api(`http://localhost:3000/folders/${folderId}`, {
        method: "DELETE",
      });

      this.active_folder.children = this.active_folder.children.filter(
        (child) => child.id !== folderId
      );
      this.read_directory_content();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }

  /**
   * Verschiebt einen Ordner in einen Zielordner.
   * @param {number} folder_id - ID des zu verschiebenden Ordners.
   * @param {number} target_folder_id - ID des Zielordners.
   */
  async move_folder_by_id(folder_id, target_folder_id) {
    try {
      const result = await this.fetch_api(
        `http://localhost:3000/folders/move`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folder_id: folder_id,
            target_folder_id: target_folder_id,
          }),
        }
      );
      console.log(result);
      this.read_directory_content();
    } catch (error) {
      console.error("Error moving folder:", error);
    }
  }

  /**
   * Verschiebt eine Datei in einen Zielordner.
   * @param {number} file_id
   * @param {number} target_folder_id
   */
  async move_file_by_id(file_id, target_folder_id) {
    try {
      const result = await this.fetch_api(`http://localhost:3000/files/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: file_id,
          target_folder_id: target_folder_id,
        }),
      });
      console.log(result);
      this.read_directory_content();
    } catch (error) {
      console.error("Error moving file:", error);
    }
  }

  /**
   * Creates a new file.
   * @param {string} fileName - The name of the file.
   * @param {string} fileType - The type of the file (e.g., 'text', 'image').
   */
  async create_file(fileName, fileType) {
    try {
      const new_file = await this.fetch_api(
        `http://localhost:3000/folders/${this.active_folder.id}/files`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
            type: fileType,
          }),
        }
      );

      this.active_folder.children.push(
        new File(
          new_file.id,
          new_file.name,
          new_file.folder_id,
          new_file.type,
          new_file.url
        )
      );
      this.read_directory_content();
    } catch (error) {
      console.error("Error creating file:", error);
    }
  }

  /**
   * Renames a file by its ID.
   * @param {number} id
   * @param {string} new_name
   */
  async rename_file_by_id(id, new_name) {
    try {
      await this.fetch_api(`http://localhost:3000/files/${id}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_name }),
      });

      const file = this.get_file_by_id(id);
      if (file) file.name = new_name;
      this.file_area_view.rebuild_view();
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  }

  /**
   * Deletes a file by its ID.
   * @param {number} fileId
   */
  async delete_file_by_id(fileId) {
    try {
      await this.fetch_api(`http://localhost:3000/files/${fileId}`, {
        method: "DELETE",
      });

      this.active_folder.children = this.active_folder.children.filter(
        (child) => child.id !== fileId
      );
      this.read_directory_content();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
}
