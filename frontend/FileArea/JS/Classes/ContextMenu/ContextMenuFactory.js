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
   * Returns the appropriate context menu based on the selected items
   * @param {Set<HTMLElement>} selected_items
   * @returns {ContextMenu}
   */
  getContextMenu(selected_items) {
    if (selected_items.size > 1) {
      this.multiple_items_context_menu.configure(Array.from(selected_items));
      return this.multiple_items_context_menu;
    } else if (selected_items.size === 1) {
      const target = Array.from(selected_items)[0];
      this.folder_context_menu.configure(target);
      return this.folder_context_menu;
    } else {
      this.file_area_context_menu.configure();
      return this.file_area_context_menu;
    }
  }
}
