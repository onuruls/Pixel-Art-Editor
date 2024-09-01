import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for renaming a folder
 */
export class RenameFolderAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
  }

  /**
   * Executes the action to rename the selected folder
   * @returns {void}
   */
  execute() {
    this.file_area.rename_selected_folder();
  }
}
