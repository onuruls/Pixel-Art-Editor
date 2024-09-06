export class CreateFolderHandler {
  constructor(file_system_handler, file_view) {
    this.file_system_handler = file_system_handler;
    this.file_view = file_view;
    this.operation_in_progress = false;
  }

  /**
   * Starts the creation of a new folder.
   */
  async create_new_folder() {
    if (this.operation_in_progress) return;

    const new_folder = this.file_view.create_new_folder();
    this.replace_name_with_input(new_folder);
    new_folder.edit_name_input.focus();

    let is_blur_handled = false;

    const handle_create = async () => {
      if (this.operation_in_progress || is_blur_handled) return;
      is_blur_handled = true;
      this.operation_in_progress = true;

      await this.handle_create_folder(new_folder);

      new_folder.edit_name_input.removeEventListener("blur", handle_create);
      new_folder.edit_name_input.removeEventListener(
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

    new_folder.edit_name_input.addEventListener("blur", handle_create);
    new_folder.edit_name_input.addEventListener("keypress", handle_key_press);
  }

  /**
   * Handles the folder creation process.
   * @param {FolderItemView} new_folder
   */
  async handle_create_folder(new_folder) {
    const folder_name = new_folder.edit_name_input.value.trim();
    if (folder_name) {
      try {
        await this.file_system_handler.create_folder(folder_name);
        new_folder.remove();
        this.file_view.rebuild_view();
      } catch (error) {
        console.error("Failed to create folder:", error);
        new_folder.remove();
      }
    } else {
      new_folder.remove();
    }
  }

  /**
   * Replaces the name field with an input field.
   * @param {FolderItemView} folder_item_view
   */
  replace_name_with_input(folder_item_view) {
    const input_field = this.create_rename_input(folder_item_view.name);
    folder_item_view.name_field.replaceWith(input_field);
    folder_item_view.edit_name_input = input_field;
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
