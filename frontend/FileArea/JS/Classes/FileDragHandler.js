import { FolderItemView } from "../Elements/FolderItemView.js";

export class FileDragHandler {
  /**
   * @constructor
   * @param {FileAreaView} file_area_view
   */
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
  }

  /**
   * Handles the drag start event for multiple selected items
   * @param {DragEvent} event
   */
  handle_drag_start(event) {
    const target = this.get_drag_target(event);

    if (target && !this.file_area_view.selected_items.has(target)) {
      this.file_area_view.select_item(target);
    }

    if (target && this.file_area_view.selected_items.has(target)) {
      const selected_ids = this.get_selected_item_ids();

      this.set_drag_data(event, selected_ids);
      event.dataTransfer.dropEffect = "move";
    }
  }

  /**
   * Handles the drag over event to allow drop
   * @param {DragEvent} event
   */
  handle_drag_over(event) {
    const target = this.get_drag_target(event);

    if (this.is_valid_drop_target(target)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  }

  /**
   * Handles the drop event to move selected items to the target folder
   * @param {DragEvent} event
   */
  async handle_drop(event) {
    event.preventDefault();
    const target = this.get_drag_target(event);

    if (this.is_valid_drop_target(target)) {
      const folder_id = this.get_folder_id(target);
      const selected_ids = this.get_selected_item_ids();

      if (this.is_valid_move(selected_ids, folder_id)) {
        await this.move_items_to_folder(target, selected_ids, folder_id);
      }
    }

    this.file_area_view.clear_selection();
  }

  /**
   * Get the target element of the drag event
   * @param {DragEvent} event
   * @returns {HTMLElement|null}
   */
  get_drag_target(event) {
    return event.target.closest(".item");
  }

  /**
   * Check if the target is a valid folder for drop
   * @param {HTMLElement|null} target
   * @returns {boolean}
   */
  is_valid_drop_target(target) {
    return target instanceof FolderItemView;
  }

  /**
   * Get the ID of the folder from the target element
   * @param {HTMLElement} target
   * @returns {number}
   */
  get_folder_id(target) {
    return parseInt(target.getAttribute("data-id"), 10);
  }

  /**
   * Get the IDs of the selected items
   * @returns {Array<number>}
   */
  get_selected_item_ids() {
    return Array.from(this.file_area_view.selected_items).map((item) =>
      parseInt(item.getAttribute("data-id"), 10)
    );
  }

  /**
   * Set the drag data with the selected item IDs
   * @param {DragEvent} event
   * @param {Array<number>} selected_ids
   */
  set_drag_data(event, selected_ids) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(selected_ids)
    );
  }

  /**
   * Check if the move is valid (not moving a folder into itself)
   * @param {Array<number>} selected_ids
   * @param {number} folder_id
   * @returns {boolean}
   */
  is_valid_move(selected_ids, folder_id) {
    if (selected_ids.includes(folder_id)) {
      console.warn("Cannot move folder into itself.");
      return false;
    }
    return true;
  }

  /**
   * Move selected items to the target folder
   * @param {HTMLElement} target
   * @param {Array<number>} selected_ids
   * @param {number} folder_id
   */
  async move_items_to_folder(target, selected_ids, folder_id) {
    if (target.name === "..") {
      // Move to parent folder
      await this.file_area_view.move_to_parent_folder(selected_ids);
    } else if (!isNaN(folder_id)) {
      // Move to selected folder
      await this.file_area_view.handle_drop_on_folder(selected_ids, folder_id);
    } else {
      console.error("Invalid folder ID detected:", folder_id);
    }
  }
}
