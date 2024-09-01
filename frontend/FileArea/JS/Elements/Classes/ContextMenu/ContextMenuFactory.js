import { FileAreaContextMenu } from "./FileAreaContextMenu.js";
import { FolderContextMenu } from "./FolderContextmenu.js";

/**
 * Factory for creating context menus based on the target.
 */
export class ContextMenuFactory {
  /**
   * @param {FileArea} fileArea
   * @param {HTMLElement} contextMenuElement
   */
  constructor(fileArea, contextMenuElement) {
    /** @type {FileArea} */
    this.fileArea = fileArea;

    /** @type {FileAreaContextMenu} */
    this.fileAreaContextMenu = new FileAreaContextMenu(
      this.fileArea,
      contextMenuElement
    );

    /** @type {FolderContextMenu} */
    this.folderContextMenu = new FolderContextMenu(
      this.fileArea,
      contextMenuElement
    );
  }

  /**
   * Returns the appropriate context menu based on the target.
   * @param {HTMLElement} target
   * @returns {ContextMenu}
   */
  getContextMenu(target) {
    if (target) {
      this.folderContextMenu.configure(target);
      return this.folderContextMenu;
    } else {
      this.fileAreaContextMenu.configure();
      return this.fileAreaContextMenu;
    }
  }
}
