import { ItemView } from "./ItemView.js";

/**
 * View-Class of a File in the FileAreaView.
 * Extends the base ItemView class to customize behavior for files.
 */
export class FileItemView extends ItemView {
  /**
   * @param {string} name
   * @param {FileAreaView} file_area_view
   * @param {number} id
   * @param {string} type
   */
  constructor(name, file_area_view, id, type) {
    super(name, file_area_view, id);
    this.type = type; // File type (e.g., png, tmx)
    this.name = name;
    this.id = id;

    this.setAttribute("draggable", true);

    this.edit_name_input = this.create_edit_name_input();
    this.update_name_field(); // Set initial name with the extension
  }

  /**
   * Creates an icon for the file based on its type.
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");

    if (this.type === "png") {
      icon.classList.add("fa-solid", "fa-file-image");
    } else if (this.type === "tmx") {
      icon.classList.add("fa-solid", "fa-file-code");
    } else {
      icon.classList.add("fa-solid", "fa-file");
    }

    return icon;
  }

  /**
   * Adds the file extension to the name for display purposes.
   */
  update_name_field() {
    this.name_field.textContent = `${this.name}.${this.type}`; // Add the file extension to the displayed name
  }

  /**
   * Creates an input field for editing the file name, excluding the extension.
   * @returns {HTMLInputElement}
   */
  create_edit_name_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.classList.add("edit-name-input");

    // Only the name without the file extension is editable
    input.value = this.name;
    return input;
  }

  /**
   * Replaces the name field with an input field for renaming.
   * The file extension is not editable.
   */
  replace_name_with_input() {
    this.replaceChild(this.edit_name_input, this.name_field);

    // Handle the 'blur' event to restore the full name (with extension) after editing
    this.edit_name_input.addEventListener("blur", () => {
      this.name = this.edit_name_input.value; // Save the updated name without the extension
      this.update_name_field(); // Update the displayed name with the extension
    });
  }
}

customElements.define("file-item", FileItemView);
