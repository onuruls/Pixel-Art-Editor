import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";

export class RenameItemHandler {
  constructor(file_system_handler, file_view) {
    this.file_system_handler = file_system_handler;
    this.file_view = file_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the renaming process for a file or folder.
   * @param {Object} item - The item to rename.
   * @param {HTMLElement} selected_item - The selected item view in the UI.
   */
  start_rename(item, selected_item) {
    const p_element = selected_item.querySelector("p");
    const original_name = item.name; // Ohne die Dateiendung
    const input_field = this.create_rename_input(original_name);

    selected_item.replaceChild(input_field, p_element);
    input_field.focus();

    const handle_action = async () => {
      if (this.operation_in_progress) return;
      this.operation_in_progress = true;

      input_field.removeEventListener("blur", handle_blur);
      input_field.removeEventListener("keypress", handle_key_press);

      await this.handle_rename(input_field, p_element, item, original_name);

      this.operation_in_progress = false;
    };

    const handle_key_press = (event) => {
      if (event.key === "Enter") {
        handle_action();
      }
    };

    const handle_blur = () => {
      if (!this.operation_in_progress) {
        handle_action();
      }
    };

    input_field.addEventListener("keypress", handle_key_press);
    input_field.addEventListener("blur", handle_blur);
  }

  /**
   * Handles the renaming process for a file or folder.
   * @param {HTMLInputElement} input_field - The input field for renaming.
   * @param {HTMLElement} p_element - The original paragraph element.
   * @param {Object} item - The item being renamed.
   * @param {string} original_name - The original name of the item.
   */
  async handle_rename(input_field, p_element, item, original_name) {
    let new_name = input_field.value.trim(); // Nur der Name, ohne Endung

    if (new_name && new_name !== original_name) {
      try {
        if (item instanceof Folder) {
          await this.file_system_handler.rename_folder_by_id(item.id, new_name);
        } else {
          await this.file_system_handler.rename_file_by_id(item.id, new_name); // Endung bleibt gleich, nur der Name ändert sich
        }
        item.name = new_name;
        p_element.textContent = new_name;
        this.file_view.rebuild_view();
      } catch (error) {
        console.error("Failed to rename the item:", error);
        p_element.textContent = original_name;
      }
    } else {
      p_element.textContent = original_name;
    }

    input_field.replaceWith(p_element);
  }

  /**
   * Creates an input field for renaming an item.
   * @param {string} value - The current name of the item.
   * @returns {HTMLInputElement}
   */
  create_rename_input(value) {
    const input_field = document.createElement("input");
    input_field.type = "text";
    input_field.value = value; // Nur der Name, ohne Endung
    input_field.classList.add("rename-input");

    setTimeout(() => {
      input_field.select();
    }, 0);

    return input_field;
  }
}
