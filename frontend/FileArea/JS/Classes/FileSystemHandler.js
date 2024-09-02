import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { Project } from "../../../EditorTool/JS/Classes/Project.js";
import { FileAreaView } from "../Elements/FileAreaView.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";

export class FileSystemHandler {
  /**
   * Handles the "FileSystem" in the FileAreaView
   * @param {FileAreaView} file_area_view
   * @param {Project} project
   */
  constructor(file_area_view, project) {
    this.file_area_view = file_area_view;
    this.file_area_view.file_system_handler = this;
    this.project = project;
    this.active_folder = project.root_folder;
    this.entries = this.normalize_entries(this.active_folder.children);
    this.folder_history = [this.active_folder];
  }

  /**
   * Normalizes the entries to instances of Folder or File.
   * @param {Array<Object>} entries
   * @returns {Array<Folder|File>}
   */
  normalize_entries(entries) {
    return entries.map((entry) => this.normalize_entry(entry));
  }

  /**
   * Converts a raw entry into an instance of Folder or File.
   * @param {Object} entry
   * @returns {Folder|File}
   */
  normalize_entry(entry) {
    if (entry instanceof Folder || entry instanceof File) {
      return entry;
    }

    if (entry.type === "folder") {
      const folder = new Folder(entry.id, entry.name, entry.folder_id);
      folder.children = this.normalize_entries(entry.children || []);
      return folder;
    } else if (entry.type === "file") {
      return new File(entry.id, entry.name, entry.folder_id, entry.type);
    } else {
      console.error("Unknown entry type", entry);
    }
  }

  /**
   * Generic fetch method to centralize API calls.
   * @param {string} url
   * @param {Object} [options={}]
   * @returns {Promise<any>}
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
   * Reads the content of the current Folder and updates the UI.
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

  /**
   * Handles directory navigation based on the name of the folder.
   * @param {String} name
   */
  change_directory_handle(name) {
    if (name === "..") {
      this.load_prev_directory();
    } else {
      this.load_new_directory(name);
    }
  }

  /**
   * Navigates to the previous folder in the history.
   */
  load_prev_directory() {
    if (this.folder_history.length > 1) {
      this.folder_history.pop();
      this.active_folder = this.folder_history[this.folder_history.length - 1];
      this.read_directory_content();
    } else {
      console.warn("No previous directory to load.");
    }
  }

  /**
   * Navigates to a new folder based on its name.
   * @param {String} name
   */
  load_new_directory(name) {
    const folder_to_load = this.entries.find(
      (item) => item instanceof Folder && item.name === name
    );

    if (!folder_to_load) {
      console.error(`Folder with name ${name} not found.`);
      return;
    }

    this.active_folder = folder_to_load;
    this.folder_history.push(this.active_folder);
    this.read_directory_content();
  }

  /**
   * Creates a new folder in the database and updates the UI.
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
        new Folder(new_folder.id, new_folder.name, new_folder.folder_id)
      );
      this.read_directory_content();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }

  /**
   * Renames a folder by ID in the backend and updates the UI.
   * @param {string} id
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

      const folder = this.find_entry_by_id(id);
      if (folder) folder.name = newName;
      this.read_directory_content();
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  }

  /**
   * Deletes a folder by ID in the backend and updates the UI.
   * @param {string} folderId
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
   * Moves the items to the specified folder and updates the UI.
   * @param {Array<string>} item_ids
   * @param {string} folder_id
   */
  async move_items_to_folder(item_ids, folder_id) {
    try {
      const moved_items = await this.fetch_api(
        `http://localhost:3000/folders/move`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ item_ids, folder_id }),
        }
      );

      const items = Array.isArray(moved_items) ? moved_items : [moved_items];

      this.active_folder.children = this.active_folder.children.filter(
        (child) => !item_ids.includes(String(child.id))
      );

      this.add_moved_items_to_folder(items, folder_id);
      this.read_directory_content();
    } catch (error) {
      console.error("Error moving items:", error);
    }
  }

  /**
   * Adds the moved items to the specified folder.
   * @param {Array} moved_items
   * @param {string} folder_id
   */
  add_moved_items_to_folder(moved_items, folder_id) {
    const target_folder = this.find_folder_by_id(folder_id);

    if (target_folder) {
      moved_items.forEach((item) => {
        if (item.children) {
          const folder = new Folder(
            item.id,
            item.name,
            item.parent_folder_id || null
          );
          folder.build_folder_structure(item.children);
          target_folder.children.push(folder);
        } else {
          target_folder.children.push(
            new File(item.id, item.name, item.folder_id, item.type)
          );
        }
      });
    }
  }

  /**
   * Finds a folder or file by its ID.
   * @param {string} id
   * @returns {Folder|File|null}
   */
  find_entry_by_id(id) {
    return this.active_folder.children.find((entry) => entry.id === id);
  }

  /**
   * Helper method to find a folder by its ID in the file structure.
   * @param {string} folder_id
   * @returns {Folder|null}
   */
  find_folder_by_id(folder_id) {
    const search_folder = (folder) => {
      if (folder.id === folder_id) return folder;
      for (const child of folder.children) {
        if (child instanceof Folder) {
          const found = search_folder(child);
          if (found) return found;
        }
      }
      return null;
    };

    return search_folder(this.project.root_folder);
  }

  /**
   * Deletes a file by ID and updates the UI.
   * @param {string} fileId
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
