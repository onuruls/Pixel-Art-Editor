import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for adding a new folder.
 */
export class AddFolderAction extends ContextMenuAction {
  constructor(fileArea) {
    super();
    /** @type {FileArea} */
    this.fileArea = fileArea;
  }

  /**
   * Executes the action to create a new folder.
   * @returns {void}
   */
  execute() {
    this.fileArea.create_new_folder();
  }
}
