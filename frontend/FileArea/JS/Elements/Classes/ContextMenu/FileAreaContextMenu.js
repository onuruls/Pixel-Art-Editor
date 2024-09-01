import { ContextMenu } from "./ContextMenu.js";
import { AddFolderAction } from "./AddFolderAction.js";

/**
 * Context menu for the file area.
 */
export class FileAreaContextMenu extends ContextMenu {
  /**
   * @param {FileArea} fileArea
   * @param {HTMLElement} menuElement
   */
  constructor(fileArea, menuElement) {
    super(menuElement);
    /** @type {FileArea} */
    this.fileArea = fileArea;

    this.actions = {
      addFolder: new AddFolderAction(this.fileArea),
    };
  }

  /**
   * Configures the context menu with available actions.
   * @returns {void}
   */
  configure() {
    this.clearOptions();
    this.addOption(() => this.actions.addFolder.execute(), "Add Folder");
  }
}
