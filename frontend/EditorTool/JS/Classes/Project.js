import { Folder } from "./Folder.js";

export class Project {
  /**
   *
   * @param {String} name
   * @param {String} created_at
   * @param {Folder} root_folder
   * @param {String} _id
   */
  constructor(name, created_at, root_folder, _id) {
    this.name = name;
    this.created_at = created_at;
    this.root_folder = root_folder;
    this._id = _id;
  }

  async update_project() {
    const response = await fetch(`http://localhost:3000/projects/${this._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    console.log("Project updated successfully:", result);
  }
}
