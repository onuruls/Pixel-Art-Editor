import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for deleting a folder
 */
export class DeleteFolderAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
  }

  /**
   * Executes the action to delete the selected folder
   * @returns {void}
   */
  execute() {
    this.file_area.delete_selected_folder();
  }
}
