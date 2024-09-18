const project_service = require("./services/ProjectService");
const folder_service = require("./services/FolderService");
const file_service = require("./services/FileService");

class DbClient {
  async get_projects() {
    return await project_service.get_projects();
  }

  async get_project(id) {
    return await project_service.get_project_by_id(id);
  }

  async new_project(name) {
    return await project_service.create_project(name);
  }

  async rename_project(id, new_name) {
    return await project_service.rename_project(id, new_name);
  }

  async delete_project(id) {
    return await project_service.delete_project(id);
  }

  async get_folder(id) {
    return await folder_service.get_folder(id);
  }

  async add_folder(parent_folder_id, folder_name) {
    return await folder_service.add_folder(parent_folder_id, folder_name);
  }

  async delete_folder(id) {
    return await folder_service.delete_folder(id);
  }

  async rename_folder(id, new_name) {
    return await folder_service.rename_folder(id, new_name);
  }

  async move_folder_to_folder(folder_id, target_folder_id) {
    return await folder_service.move_folder_to_folder(
      folder_id,
      target_folder_id
    );
  }

  async add_file(folder_id, name, type) {
    return await file_service.add_file(folder_id, name, type);
  }

  async get_file(id) {
    return await file_service.get_file(id);
  }

  async delete_file(id) {
    return await file_service.delete_file(id);
  }

  async rename_file(id, new_name) {
    return await file_service.rename_file(id, new_name);
  }

  async move_file_to_folder(file_id, target_folder_id) {
    return await file_service.move_file_to_folder(file_id, target_folder_id);
  }
}

module.exports = DbClient;
