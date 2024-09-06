export class RenameInputHandler {
  constructor(file_system_handler, file_view) {
    this.file_system_handler = file_system_handler;
    this.file_view = file_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the renaming process by replacing the text element with an input field.
   * @param {Object} item
   * @param {HTMLElement} selected_item
   */
  start_rename(item, selected_item) {
    const p_element = selected_item.querySelector("p");
    const original_name = item.name;

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
   * Handles the renaming of an item.
   * @param {HTMLInputElement} input_field
   * @param {HTMLElement} p_element
   * @param {Object} item
   * @param {string} original_name
   */
  async handle_rename(input_field, p_element, item, original_name) {
    const new_name = input_field.value.trim();

    if (new_name && new_name !== original_name) {
      try {
        await this.file_system_handler.rename_folder_by_id(item.id, new_name);
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
   * Creates an input field for renaming.
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
