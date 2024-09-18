import { FileArea } from "../../../Elements/FileArea.js";
import { ContextMenuAction } from "./ContextMenuAction.js";

/**
 * Action for renaming a folder
 */
export class RenameItemAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super(file_area);
  }

  /**
   * Executes the action to rename the selected folder
   * @returns {void}
   */
  execute() {
    this.file_area.rename_selected_items();
  }
}
