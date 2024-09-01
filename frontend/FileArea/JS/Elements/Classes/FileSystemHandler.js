import { Folder } from "../../../../EditorTool/JS/Classes/Folder.js";
import { Project } from "../../../../EditorTool/JS/Classes/Project.js";
import { FileAreaView } from "../FileAreaView.js";

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
    this.entries = [...this.active_folder.children];
    this.folder_history = [this.active_folder];
  }

  /**
   * Reads the content of the current Folder
   * and updates the UI
   */
  async read_directory_content() {
    if (!this.active_folder || !this.active_folder.children) {
      console.error("Active folder is not defined or has no children.");
      return;
    }

    if (!this.active_folder.children.length) {
      const response = await fetch(
        `http://localhost:3000/folders/${this.active_folder.id}`
      );
      const folder_data = await response.json();
      this.active_folder.build_folder_structure(folder_data.children);
    }

    this.entries = this.active_folder.children;
    this.file_area_view.rebuild_view();
  }

  /**
   * Decides if the user moves up or down the filesystem
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
   * Loads prev folder and reads the content
   */
  load_prev_directory() {
    this.folder_history.pop();
    this.active_folder = this.folder_history[this.folder_history.length - 1];
    this.read_directory_content();
  }

  /**
   * Loads new Folder and reads the content
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
   * Creates a new folder in the database.
   * @param {string} folderName
   * @returns {Promise<void>}
   */
  async create_folder(folderName) {
    const response = await fetch("http://localhost:3000/projects/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder_id: this.active_folder.id,
        folder_name: folderName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create the folder.");
    }

    const folder_obj = await response.json();
    const new_folder = new Folder(
      folder_obj.id,
      folder_obj.name,
      folder_obj.folder_id
    );
    this.active_folder.children.push(new_folder);
    this.read_directory_content();
  }

  /**
   * Renames a folder by ID.
   * @param {string} id
   * @param {string} newName
   */
  async rename_folder_by_id(id, newName) {
    try {
      const response = await fetch(
        `http://localhost:3000/folders/${id}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rename the folder.");
      }

      const folder = this.active_folder.children.find(
        (child) => child.id === id
      );
      if (folder) {
        folder.name = newName;
      } else {
        console.error(`Folder with ID ${id} not found in active folder.`);
      }

      console.log(`Folder with ID ${id} renamed to ${newName}.`);
    } catch (error) {
      console.error("Failed to rename the folder on the server:", error);
      throw error;
    }
  }

  /**
   * Deletes a folder by ID and updates the UI.
   * @param {string} folderId
   * @returns {Promise<void>}
   */
  async delete_folder_by_id(folderId) {
    try {
      await fetch(`http://localhost:3000/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.active_folder.children = this.active_folder.children.filter(
        (child) => child.id !== folderId
      );

      console.log(`Folder with ID ${folderId} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete the folder from the server:", error);
    }

    this.read_directory_content();
  }

  /**
   * Deletes a file by ID and updates the UI.
   * @param {string} fileId
   * @returns {Promise<void>}
   */
  async delete_file_by_id(fileId) {
    console.log("not implemented yet");
  }
}
