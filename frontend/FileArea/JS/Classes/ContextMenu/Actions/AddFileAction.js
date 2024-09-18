import { FileArea } from "../../../Elements/FileArea.js";
import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for adding a new file
 */
export class AddFileAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   * @param {string} file_type
   */
  constructor(file_area, file_type) {
    super(file_area);
    this.file_type = file_type;
  }

  /**
   * Executes the action to create a new file
   * @returns {void}
   */
  execute() {
    this.file_area.create_new_item(this.file_type);
  }
}
