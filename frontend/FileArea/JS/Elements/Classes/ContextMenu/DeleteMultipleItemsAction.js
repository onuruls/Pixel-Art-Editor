/**
 * Action for deleting multiple folders
 */
import { ContextMenuAction } from "./ContextMenuAction.js";

export class DeleteMultipleItemsAction extends ContextMenuAction {
  /**
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
  }

  /**
   * Executes the action to delete multiple selected folders
   * @returns {void}
   */
  execute() {
    const selected_items = Array.from(this.file_area.selected_items);

    const delete_promises = selected_items.map((item) => {
      const id = parseInt(item.getAttribute("data-id"), 10);
      return this.file_area.file_system_handler.delete_folder_by_id(id);
    });

    Promise.all(delete_promises)
      .then(() => {
        selected_items.forEach((item) =>
          this.file_area.remove_item_from_view(item)
        );
        this.file_area.selected_items.clear();
      })
      .catch((error) => {
        console.error("Failed to delete multiple folders:", error);
      });
  }
}
