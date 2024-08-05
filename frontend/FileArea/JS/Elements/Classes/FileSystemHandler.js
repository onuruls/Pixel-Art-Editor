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
  read_directory_content() {
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
    this.active_folder = this.entries.find(
      (item) => item instanceof Folder && item.name === name
    );
    this.folder_history.push(this.active_folder);
    this.read_directory_content();
  }

  /**
   * Creates a new Folder in the Database
   */
  async create_folder() {
    const response = await fetch("http://localhost:3000/projects/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folder_id: this.active_folder.id }),
    });
    const folder_obj = await response.json();
    const new_folder = new Folder(
      folder_obj.id,
      folder_obj.name,
      folder_obj.folder_id
    );
    this.active_folder.children.push(new_folder);
    this.read_directory_content();
  }

  rename_folder() {}

  delete_folder() {}
}
