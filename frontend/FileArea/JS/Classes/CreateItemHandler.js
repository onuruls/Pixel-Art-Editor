export class CreateItemHandler {
  constructor(file_system_handler, file_view) {
    this.file_system_handler = file_system_handler;
    this.file_view = file_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the creation of a new item (file or folder).
   * @param {string} itemType - The type of the item ('file' or 'folder').
   */
  async create_new_item(itemType = "folder") {
    if (this.operation_in_progress) return;

    const newItem =
      itemType === "folder"
        ? this.file_view.create_new_folder()
        : this.file_view.create_new_file();

    this.replace_name_with_input(newItem);
    newItem.edit_name_input.focus();

    let is_blur_handled = false;

    const handle_create = async () => {
      if (this.operation_in_progress || is_blur_handled) return;
      is_blur_handled = true;
      this.operation_in_progress = true;

      await this.handle_create_item(newItem, itemType);

      newItem.edit_name_input.removeEventListener("blur", handle_create);
      newItem.edit_name_input.removeEventListener("keypress", handle_key_press);

      this.operation_in_progress = false;
    };

    const handle_key_press = (event) => {
      if (event.key === "Enter") {
        handle_create();
      }
    };

    newItem.edit_name_input.addEventListener("blur", handle_create);
    newItem.edit_name_input.addEventListener("keypress", handle_key_press);
  }

  /**
   * Handles the creation process for a file or folder.
   * @param {HTMLElement} newItem - The new item (file or folder) to be created.
   * @param {string} itemType - The type of the item ('file' or 'folder').
   */
  async handle_create_item(newItem, itemType) {
    console.log(itemType);
    const item_name = newItem.edit_name_input.value.trim();
    if (item_name) {
      try {
        if (itemType === "folder") {
          await this.file_system_handler.create_folder(item_name);
        } else {
          await this.file_system_handler.create_file(item_name, "file");
        }
        newItem.remove();
        this.file_view.rebuild_view();
      } catch (error) {
        console.error(`Failed to create ${itemType}:`, error);
        newItem.remove();
      }
    } else {
      newItem.remove();
    }
  }

  /**
   * Replaces the name field with an input field.
   * @param {HTMLElement} itemView - The view of the item being edited.
   */
  replace_name_with_input(itemView) {
    const input_field = this.create_rename_input(itemView.name);
    itemView.name_field.replaceWith(input_field);
    itemView.edit_name_input = input_field;
  }

  /**
   * Creates an input field for editing the item name.
   * @param {string} value - The initial value of the input field.
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
