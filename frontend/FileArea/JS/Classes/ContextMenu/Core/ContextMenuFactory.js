import { FileArea } from "../../../Elements/FileArea.js";
import { FileAreaContextMenu } from "../Menus/FileAreaContextMenu.js";
import { ItemContextMenu } from "../Menus/ItemContextMenu.js";
import { MultipleItemsContextMenu } from "../Menus/MultipleItemsContextMenu.js";

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
    this.item_context_menu = new ItemContextMenu(
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
   *
   * @param {Set<HTMLElement>} selected_items
   * @returns {ContextMenu}
   */
  getContextMenu(selected_items) {
    const items_array = Array.from(selected_items);

    if (selected_items.size > 1) {
      return this.configureMultipleItemsContextMenu(items_array);
    }

    if (selected_items.size === 1) {
      return this.configureItemContextMenu(items_array[0]);
    }

    return this.configureFileAreaContextMenu();
  }

  /**
   * Configures and returns the multiple items context menu
   *
   * @param {HTMLElement[]} items_array
   * @returns {MultipleItemsContextMenu}
   */
  configureMultipleItemsContextMenu(items_array) {
    this.multiple_items_context_menu.configure(items_array);
    return this.multiple_items_context_menu;
  }

  /**
   * Configures and returns the single item context menu
   *
   * @param {HTMLElement} target
   * @returns {ItemContextMenu}
   */
  configureItemContextMenu(target) {
    this.item_context_menu.configure(target);
    return this.item_context_menu;
  }

  /**
   * Configures and returns the file area context menu
   *
   * @returns {FileAreaContextMenu}
   */
  configureFileAreaContextMenu() {
    this.file_area_context_menu.configure();
    return this.file_area_context_menu;
  }
}
