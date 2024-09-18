import { FileAreaView } from "../../Elements/FileAreaView.js";
import { FileSystemHandler } from "../Service/FileSystemHandler.js";

export class CreateItemHandler {
  /**
   * Handles the creation of new items (files or folders) in the file system.
   * @param {FileSystemHandler} file_system_handler
   * @param {FileAreaView} file_view
   */
  constructor(file_system_handler, file_view) {
    this.file_system_handler = file_system_handler;
    this.file_view = file_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the creation of a new item (file or folder).
   */
  async create_new_item(item_type = "folder") {
    if (this.operation_in_progress) return;

    const new_item =
      item_type === "folder"
        ? this.file_view.create_new_folder()
        : this.file_view.create_new_file(item_type);

    this.prepare_for_editing(new_item);
    this.setup_input_event_handlers(new_item, item_type);
  }

  /**
   * Handles the creation process for a file or folder.
   */
  async handle_create_item(new_item, item_type) {
    const item_name = this.get_item_name(new_item);

    if (item_name) {
      try {
        await this.create_item_in_file_system(item_name, item_type);
      } catch (error) {
        console.error(`Failed to create ${item_type}:`, error);
      }
    }

    new_item.remove();
  }

  /**
   * Replaces the name field with an input field for editing.
   */
  prepare_for_editing(item_view) {
    const input_field = this.create_rename_input(item_view.name);
    item_view.name_field.replaceWith(input_field);
    item_view.edit_name_input = input_field;
    input_field.focus();
  }

  /**
   * Sets up event handlers for the input field to handle item creation.
   */
  setup_input_event_handlers(new_item, item_type) {
    let is_blur_handled = false;

    const handle_create = async () => {
      if (this.operation_in_progress || is_blur_handled) return;
      is_blur_handled = true;
      this.operation_in_progress = true;

      await this.handle_create_item(new_item, item_type);

      new_item.edit_name_input.removeEventListener("blur", handle_create);
      new_item.edit_name_input.removeEventListener(
        "keypress",
        handle_key_press
      );

      this.operation_in_progress = false;
    };

    const handle_key_press = (event) => {
      if (event.key === "Enter") {
        handle_create();
      }
    };

    new_item.edit_name_input.addEventListener("blur", handle_create);
    new_item.edit_name_input.addEventListener("keypress", handle_key_press);
  }

  /**
   * Creates an input field for renaming the item.
   */
  create_rename_input(value) {
    const input_field = document.createElement("input");
    input_field.type = "text";
    input_field.value = value;
    input_field.classList.add("rename-input");

    setTimeout(() => input_field.select(), 0);

    return input_field;
  }

  /**
   * Retrieves the name of the new item from the input field.
   */
  get_item_name(new_item) {
    return new_item.edit_name_input.value.trim();
  }

  /**
   * Creates the new item (file or folder) in the file system.
   */
  async create_item_in_file_system(item_name, item_type) {
    if (item_type === "folder") {
      await this.file_system_handler.create_folder(item_name);
    } else {
      await this.file_system_handler.create_file(item_name, item_type);
    }
  }
}
