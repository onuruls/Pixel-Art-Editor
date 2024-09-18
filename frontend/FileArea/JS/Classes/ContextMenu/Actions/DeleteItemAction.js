import { FileArea } from "../../../Elements/FileArea.js";
import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for deleting a folder
 */
export class DeleteItemAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super(file_area);
  }

  /**
   * Executes the action to delete the selected folder
   * @returns {void}
   */
  execute() {
    console.log("delete context executed");
    this.file_area.delete_selected_items();
  }
}
