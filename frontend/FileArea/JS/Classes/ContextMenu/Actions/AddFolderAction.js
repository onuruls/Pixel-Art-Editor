import { FileArea } from "../../../Elements/FileArea.js";
import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for adding a new folder
 */
export class AddFolderAction extends ContextMenuAction {
  /**
   *
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super(file_area);
  }

  /**
   * Executes the action to create a new folder
   * @returns {void}
   */
  execute() {
    this.file_area.create_new_item("folder");
  }
}
