import { FileAreaContextMenu } from "./FileAreaContextMenu.js";
import { FolderContextMenu } from "./FolderContextmenu.js";
import { MultipleItemsContextMenu } from "./MultipleItemsContextMenu.js";

export class ContextMenuFactory {
  /**
   * @param {FileArea} file_area
   * @param {HTMLElement} context_menu_element
   */
  constructor(file_area, context_menu_element) {
    this.file_area = file_area;
    this.file_area_context_menu = new FileAreaContextMenu(
      this.file_area,
      context_menu_element
    );
    this.folder_context_menu = new FolderContextMenu(
      this.file_area,
      context_menu_element
    );
    this.multiple_items_context_menu = new MultipleItemsContextMenu(
      this.file_area,
      context_menu_element
    );
  }

  /**
   * Returns context menu based on the target and selection state
   * @param {HTMLElement} target
   * @param {boolean} multiple_selection
   * @returns {ContextMenu}
   */
  getContextMenu(target, multiple_selection = false) {
    if (multiple_selection) {
      this.multiple_items_context_menu.configure();
      return this.multiple_items_context_menu;
    } else if (target) {
      this.folder_context_menu.configure(target);
      return this.folder_context_menu;
    } else {
      this.file_area_context_menu.configure();
      return this.file_area_context_menu;
    }
  }
}
