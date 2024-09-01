import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for renaming a folder.
 */
export class RenameFolderAction extends ContextMenuAction {
  /**
   * @param {FileArea} fileArea
   */
  constructor(fileArea) {
    super();
    /** @type {FileArea} */
    this.fileArea = fileArea;
  }

  /**
   * Executes the action to rename the selected folder.
   * @returns {void}
   */
  execute() {
    this.fileArea.rename_selected_folder();
  }
}
