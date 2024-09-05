import { ContextMenu } from "./ContextMenu.js";
import { RenameFolderAction } from "./RenameFolderAction.js";
import { DeleteFolderAction } from "./DeleteFolderAction.js";

/**
 * Context menu for a folder
 */
export class FolderContextMenu extends ContextMenu {
  /**
   * @param {FileArea} file_area
   * @param {HTMLElement} menu_element
   */
  constructor(file_area, menu_element) {
    super(menu_element);
    this.file_area = file_area;

    this.actions = {
      rename_folder: new RenameFolderAction(this.file_area),
      delete_folder: new DeleteFolderAction(this.file_area),
    };
  }

  /**
   * Configures the context menu for a specific target folder
   * @param {HTMLElement} target
   * @returns {void}
   */
  configure(target) {
    this.clearOptions();
    this.addOption(
      () => this.actions.rename_folder.execute(target),
      "Rename Folder"
    );
    this.addOption(
      () => this.actions.delete_folder.execute(target),
      "Delete Folder"
    );
  }
}
