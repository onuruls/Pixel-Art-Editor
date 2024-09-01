/**
 * Context menu for multiple selected folders
 */
import { ContextMenu } from "./ContextMenu.js";
import { DeleteMultipleItemsAction } from "./DeleteMultipleItemsAction.js";

export class MultipleItemsContextMenu extends ContextMenu {
  /**
   * @param {FileArea} file_area
   * @param {HTMLElement} menu_element
   */
  constructor(file_area, menu_element) {
    super(menu_element);
    this.file_area = file_area;

    this.actions = {
      delete_multiple: new DeleteMultipleItemsAction(this.file_area),
    };
  }

  /**
   * Configures the context menu for multiple folders
   * @returns {void}
   */
  configure() {
    this.clearOptions();
    this.addOption(
      () => this.actions.delete_multiple.execute(),
      "Delete selected items"
    );
  }
}
