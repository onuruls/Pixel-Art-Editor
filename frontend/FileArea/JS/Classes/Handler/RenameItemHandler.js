import { Folder } from "../../../../EditorTool/JS/Classes/Folder.js";
import { File } from "../../../../EditorTool/JS/Classes/File.js";

export class RenameItemHandler {
  constructor(file_system_handler, file_area_view) {
    this.file_system_handler = file_system_handler;
    this.file_area_view = file_area_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the renaming process for a file or folder.
   *
   * @param {Object} item
   * @param {HTMLElement} selected_item
   */
  start_rename(item, selected_item) {
    if (this.operation_in_progress) return;

    const p_element = selected_item.querySelector("p");
    const original_name = item.name;
    const input_field = this.create_rename_input(original_name);

    this.replace_with_input(selected_item, input_field, p_element);
    this.add_rename_event_listeners(
      input_field,
      p_element,
      item,
      original_name
    );
  }

  /**
   * Handles the final renaming action after user input.
   *
   * @param {HTMLInputElement} input_field
   * @param {HTMLElement} p_element
   * @param {Object} item
   * @param {string} original_name
   */
  async finalize_rename(input_field, p_element, item, original_name) {
    this.operation_in_progress = true;

    const new_name = input_field.value.trim();
    if (new_name && new_name !== original_name) {
      try {
        await this.rename_item(item, new_name);
        item.name = new_name;
        this.file_area_view.rebuild_view();
      } catch (error) {
        console.error("Failed to rename the item:", error);
        p_element.textContent = original_name;
      }
    } else {
      p_element.textContent = original_name;
    }

    input_field.replaceWith(p_element);
    this.operation_in_progress = false;
  }

  /**
   * Renames the item by communicating with the file system handler.
   *
   * @param {Object} item
   * @param {string} new_name
   */
  async rename_item(item, new_name) {
    if (item instanceof Folder) {
      await this.file_system_handler.rename_folder_by_id(item.id, new_name);
    } else if (item instanceof File) {
      await this.file_system_handler.rename_file_by_id(item.id, new_name);
    } else {
      throw new Error("Unknown item type:", item);
    }
  }

  /**
   * Replaces the existing element with the input field for renaming.
   *
   * @param {HTMLElement} selected_item
   * @param {HTMLInputElement} input_field
   * @param {HTMLElement} p_element
   */
  replace_with_input(selected_item, input_field, p_element) {
    selected_item.replaceChild(input_field, p_element);
    input_field.focus();
  }

  /**
   * Adds event listeners to the input field for handling renaming.
   *
   * @param {HTMLInputElement} input_field
   * @param {HTMLElement} p_element
   * @param {Object} item
   * @param {string} original_name
   */
  add_rename_event_listeners(input_field, p_element, item, original_name) {
    const handle_key_press = (event) => {
      if (event.key === "Enter") {
        this.finalize_rename(input_field, p_element, item, original_name);
      }
    };

    const handle_blur = () => {
      if (!this.operation_in_progress) {
        this.finalize_rename(input_field, p_element, item, original_name);
      }
    };

    input_field.addEventListener("keypress", handle_key_press);
    input_field.addEventListener("blur", handle_blur);
  }

  /**
   * Creates an input field for renaming an item.
   *
   * @param {string} value
   * @returns {HTMLInputElement}
   */
  create_rename_input(value) {
    const input_field = document.createElement("input");
    input_field.type = "text";
    input_field.value = value;
    input_field.classList.add("rename-input");

    setTimeout(() => {
      input_field.select();
    }, 0);

    return input_field;
  }
}
