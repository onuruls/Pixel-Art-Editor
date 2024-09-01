import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for adding a new folder
 */
export class AddFolderAction extends ContextMenuAction {
  constructor(file_area) {
    super();

    this.file_area = file_area;
  }

  /**
   * Executes the action to create a new folder
   * @returns {void}
   */
  execute() {
    this.file_area.create_new_folder();
  }
}
