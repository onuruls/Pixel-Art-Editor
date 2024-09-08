import { ContextMenu } from "./ContextMenu.js";
import { RenameItemAction } from "./RenameItemAction.js";
import { DeleteItemAction } from "./DeleteItemAction.js";

/**
 * Context menu for a folder
 */
export class ItemContextMenu extends ContextMenu {
  /**
   * @param {FileArea} file_area
   * @param {HTMLElement} menu_element
   */
  constructor(file_area, menu_element) {
    super(menu_element);
    this.file_area = file_area;

    this.actions = {
      rename_item: new RenameItemAction(this.file_area),
      delete_item: new DeleteItemAction(this.file_area),
    };
  }

  /**
   * Configures the context menu for a specific target folder
   * @param {HTMLElement} target
   * @returns {void}
   */
  configure(target) {
    this.clearOptions();
    this.addOption(() => this.actions.rename_item.execute(target), "Rename");
    this.addOption(() => this.actions.delete_item.execute(target), "Delete");
  }
}
