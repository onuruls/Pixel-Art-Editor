export class BackendClient {
  // ----- Projects -----
  // --------------------

  /**
   * Sends POST-Request for a new project
   * @param {String} project_name
   * @returns {any}
   */
  static async create_new_project(project_name) {
    const response = await fetch("http://localhost:3000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: project_name }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  }

  /**
   * Fetches a list of projects from the database
   * @returns {any}
   */
  static async get_project_list() {
    const response = await fetch("http://localhost:3000/projects");
    if (!response.ok) {
      throw new Error("Error fetching projects.");
    }
    return await response.json();
  }

  /**
   * Fetches a single project from the backend
   * @param {String} project_id
   * @returns {any}
   */
  static async get_project_by_id(project_id) {
    const response = await fetch(
      `http://localhost:3000/projects/${project_id}`
    );
    return await response.json();
  }

  /**
   * Sends PUT-Request to rename a project
   * @param {String} project_id
   * @param {String} new_name
   */
  static async rename_project(project_id, new_name) {
    const response = await fetch(
      `http://localhost:3000/projects/${project_id}/rename`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_name }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to rename project.");
    }
  }

  /**
   * Sends DELETE-Request to delete a project
   * @param {String} project_id
   */
  static async delete_project(project_id) {
    const response = await fetch(
      `http://localhost:3000/projects/${project_id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete project.");
    }
  }

  // ----- Folders -------
  // ---------------------

  /**
   * Fetches the content of a folder
   * @param {String} folder_id
   * @returns {any}
   */
  static async read_directory_content(folder_id) {
    const response = await fetch(`http://localhost:3000/folders/${folder_id}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Sends POST-Request to create a new Folder
   * @param {String} folder_id
   * @param {String} folder_name
   * @returns {any}
   */
  static async create_folder(folder_id, folder_name) {
    const response = await fetch("http://localhost:3000/projects/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder_id: folder_id,
        folder_name: folder_name,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Sends PUT-Request to rename a folder with given id
   * @param {String} id
   * @param {String} new_name
   * @returns {String}
   */
  static async rename_folder_by_id(id, new_name) {
    const response = await fetch(`http://localhost:3000/folders/${id}/rename`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_name }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Sends PUT-Request to move folder into another folder
   * @param {String} folder_id
   * @param {String} target_folder_id
   * @returns {any}
   */
  static async move_folder_by_id(folder_id, target_folder_id) {
    const response = await fetch(`http://localhost:3000/folders/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder_id: folder_id,
        target_folder_id: target_folder_id,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Sends DELETE-Request to delete the folder with the given id
   * @param {String} folder_id
   * @returns {String}
   */
  static async delete_folder_by_id(folder_id) {
    const response = await fetch(`http://localhost:3000/folders/${folder_id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  }

  // ----- Files -------
  // ---------------------

  /**
   * Sends POST-Request to create a new file in the folder with
   * the given id, from the given type
   * @param {String} file_name
   * @param {String} file_type
   * @param {Array<Array<String>>} matrix_data
   * @returns {any}
   */
  static async create_file(folder_id, file_name, file_type, matrix_data) {
    const response = await fetch(
      `http://localhost:3000/folders/${folder_id}/files`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file_name,
          type: file_type,
          matrix_data: matrix_data,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Sends PUT-Request to move a file into the folder with
   * the given folder id
   * @param {String} file_id
   * @param {String} target_folder_id
   * @returns {any}
   */
  static async move_file_by_id(file_id, target_folder_id) {
    const response = await fetch(`http://localhost:3000/files/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: file_id,
        target_folder_id: target_folder_id,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  }

  /**
   * Sends PUT-Request to update the content of a file.
   * @param {String} file_id
   * @param {String} content
   * @returns {any}
   */
  static async write_file(file_id, content) {
    const response = await fetch(`http://localhost:3000/files/${file_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.text();
  }

  /**
   * Sends PUT-Request to rename a file with the given id
   * @param {String} file_id
   * @param {String} new_name
   * @returns {String}
   */
  static async rename_file_by_id(file_id, new_name) {
    const response = await fetch(
      `http://localhost:3000/files/${file_id}/rename`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_name }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Sends DELETE-Request to delete the file with the given id
   * @param {String} file_id
   * @returns {String}
   */
  static async delete_file_by_id(file_id) {
    const response = await fetch(`http://localhost:3000/files/${file_id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  }
}
