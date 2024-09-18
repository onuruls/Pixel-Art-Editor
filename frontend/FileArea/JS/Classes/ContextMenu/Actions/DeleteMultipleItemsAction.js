import { FileArea } from "../../../Elements/FileArea.js";
import { ContextMenuAction } from "./ContextMenuAction.js";

export class DeleteMultipleItemsAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super(file_area);
  }

  /**
   * Executes the action to delete multiple selected folders
   * @returns {void}
   */
  execute() {
    this.file_area.delete_selected_items();
  }
}
