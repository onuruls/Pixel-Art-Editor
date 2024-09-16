import { FolderItemView } from "../../Elements/FolderItemView.js";
import { FileItemView } from "../../Elements/FileItemView.js";

export class FileDragHandler {
  /**
   * Handles drag and drop operations in the file area.
   *
   * @param {FileAreaView} file_area_view
   */
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
  }

  /**
   * Handles the start of a drag operation.
   *
   * @param {DragEvent} event
   */
  handle_drag_start(event) {
    const target = this.get_drag_target(event);

    if (
      target &&
      !this.file_area_view.selection_handler.selected_items.has(target)
    ) {
      this.file_area_view.selection_handler.select_item(target);
    }

    event.dataTransfer.dropEffect = "move";
  }

  /**
   * Handles dragging over a potential drop target.
   *
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
   * Handles the drop event and moves selected items to the target folder.
   *
   * @param {DragEvent} event
   */
  async handle_drop(event) {
    event.preventDefault();
    const target = this.get_drag_target(event);

    if (this.is_valid_drop_target(target)) {
      const folder_id = this.get_folder_id(target);

      if (this.is_valid_move(folder_id)) {
        await this.move_items_to_folder(target, folder_id);
      }
    }

    this.file_area_view.selection_handler.clear_selection();
  }

  /**
   * Retrieves the drag target element.
   *
   * @param {DragEvent} event
   * @returns {HTMLElement|null}
   */
  get_drag_target(event) {
    return event.target.closest(".item");
  }

  /**
   * Checks if the target is a valid folder to drop items into.
   *
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  is_valid_drop_target(target) {
    return target instanceof FolderItemView;
  }

  /**
   * Retrieves the folder ID from the target element.
   *
   * @param {HTMLElement} target
   * @returns {string}
   */
  get_folder_id(target) {
    return target.id;
  }

  /**
   * Checks if the selected items can be moved to the target folder.
   *
   * @param {string} target_folder_id
   * @returns {boolean}
   */
  is_valid_move(target_folder_id) {
    const { selected_items } = this.file_area_view.selection_handler;

    for (const item of selected_items) {
      if (item instanceof FolderItemView && item.id === target_folder_id) {
        return false;
      }
    }

    return true;
  }

  /**
   * Moves the selected items to the specified folder.
   *
   * @param {HTMLElement} target
   * @param {string} folder_id
   */
  async move_items_to_folder(target, folder_id) {
    if (target.name === "..") {
      const parent_folder_id =
        this.file_area_view.file_area.file_system_handler.get_parent_folder_id();

      if (parent_folder_id) {
        await this.file_area_view.file_area.move_selected_items_to_folder(
          parent_folder_id
        );
      } else {
        console.warn("No parent folder found.");
      }
    } else {
      await this.file_area_view.file_area.move_selected_items_to_folder(
        folder_id
      );
    }
  }
}
