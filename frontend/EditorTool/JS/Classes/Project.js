import { Folder } from "./Folder.js";

export class Project {
  /**
   * Represents a whole project with all its folders and files
   * @param {Number} id
   * @param {String} name
   * @param {String} created_at
   * @param {Number} root_folder_id
   * @param {Folder} root_folder
   */
  constructor(id, name, created_at, root_folder_id, root_folder = null) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.root_folder_id = root_folder_id;
    this.root_folder = root_folder;
  }

  /**
   * Rebuilds the project structure out of a response object
   * @param {Object} root_folder_obj
   */
  build_project_structure(root_folder_obj) {
    this.root_folder = new Folder(
      root_folder_obj.id,
      root_folder_obj.name,
      null,
      null
    );
    this.root_folder.build_folder_structure(root_folder_obj.children);
  }
}
