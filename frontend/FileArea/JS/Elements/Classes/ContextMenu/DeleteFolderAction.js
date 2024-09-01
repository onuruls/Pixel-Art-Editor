import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for deleting a folder.
 */
export class DeleteFolderAction extends ContextMenuAction {
  /**
   * @param {FileArea} fileArea
   */
  constructor(fileArea) {
    super();
    /** @type {FileArea} */
    this.fileArea = fileArea;
  }

  /**
   * Executes the action to delete the selected folder.
   * @returns {void}
   */
  execute() {
    this.fileArea.delete_selected_folder();
  }
}
