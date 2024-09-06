import { FolderItemView } from "../Elements/FolderItemView.js";

export class FileDragHandler {
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
  }

  handle_drag_start(event) {
    const target = this.get_drag_target(event);

    if (
      target &&
      !this.file_area_view.selection_handler.selected_items.has(target)
    ) {
      this.file_area_view.selection_handler.select_item(target);
    }

    const selected_ids = this.get_selected_item_ids();
    this.set_drag_data(event, selected_ids);
    event.dataTransfer.dropEffect = "move";
  }

  handle_drag_over(event) {
    const target = this.get_drag_target(event);

    if (this.is_valid_drop_target(target)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  }

  async handle_drop(event) {
    event.preventDefault();
    const target = this.get_drag_target(event);

    if (this.is_valid_drop_target(target)) {
      const folder_id = this.get_folder_id(target);
      const selected_ids = this.get_selected_item_ids();

      if (this.is_valid_move(selected_ids, folder_id)) {
        if (target.name === "..") {
          const parent_folder_id =
            this.file_area_view.file_area.file_system_handler.get_parent_folder_id();

          if (parent_folder_id) {
            await this.file_area_view.file_area.file_system_handler.move_items_to_folder(
              selected_ids,
              parent_folder_id
            );
          } else {
            console.warn("No parent folder found.");
          }
        } else {
          await this.file_area_view.file_area.file_system_handler.move_items_to_folder(
            selected_ids,
            folder_id
          );
        }
      }
    }

    this.file_area_view.selection_handler.clear_selection();
    this.file_area_view.rebuild_view();
  }

  get_drag_target(event) {
    return event.target.closest(".item");
  }

  is_valid_drop_target(target) {
    return target instanceof FolderItemView;
  }

  get_folder_id(target) {
    return target.id;
  }

  get_selected_item_ids() {
    return Array.from(this.file_area_view.selection_handler.selected_items).map(
      (item) => item.id
    );
  }

  set_drag_data(event, selected_ids) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(selected_ids)
    );
  }

  is_valid_move(selected_ids, folder_id) {
    if (selected_ids.includes(folder_id)) {
      console.warn("Cannot move folder into itself.");
      return false;
    }
    return true;
  }
}
