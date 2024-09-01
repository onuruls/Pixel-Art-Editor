import { ContextMenu } from "./ContextMenu.js";
import { RenameFolderAction } from "./RenameFolderAction.js";
import { DeleteFolderAction } from "./DeleteFolderAction.js";

/**
 * Context menu for a folder.
 */
export class FolderContextMenu extends ContextMenu {
  /**
   * @param {FileArea} fileArea
   * @param {HTMLElement} menuElement
   */
  constructor(fileArea, menuElement) {
    super(menuElement);
    /** @type {FileArea} */
    this.fileArea = fileArea;

    this.actions = {
      renameFolder: new RenameFolderAction(this.fileArea),
      deleteFolder: new DeleteFolderAction(this.fileArea),
    };
  }

  /**
   * Configures the context menu for a specific target folder.
   * @param {HTMLElement} target
   * @returns {void}
   */
  configure(target) {
    this.clearOptions();
    this.addOption(
      () => this.actions.renameFolder.execute(target),
      "Rename Folder"
    );
    this.addOption(
      () => this.actions.deleteFolder.execute(target),
      "Delete Folder"
    );
  }
}
