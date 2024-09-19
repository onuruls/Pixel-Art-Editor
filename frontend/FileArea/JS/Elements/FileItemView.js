import { FileAreaView } from "./FileAreaView.js";
import { ItemView } from "./ItemView.js";

/**
 * View-Class of a File in the FileAreaView.
 * Extends the base ItemView class to customize behavior for files.
 */
export class FileItemView extends ItemView {
  /**
   * @param {String} name
   * @param {FileAreaView} file_area_view
   * @param {Number} id
   * @param {String} type
   */
  constructor(name, file_area_view, id, type) {
    super(name, file_area_view, id);
    this.id = id;
    this.type = type;
    this.file_area_view = file_area_view;
    this.file_area = this.file_area_view.file_area;
    this.setAttribute("draggable", true);
    this.edit_name_input = this.create_edit_name_input();
    this.update_name_field();
    this.init();
  }

  /**
   * Creates an icon for the file based on its type.
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file");
    return icon;
  }

  /**
   * Initializes the file item view with custom event listeners
   */
  init() {
    super.init();
    switch (this.type) {
      case "png":
        this.icon.addEventListener(
          "dblclick",
          this.open_sprite_file.bind(this)
        );
        break;
      case "tmx":
        //TODO: Implement TMX file opening
        break;
    }
  }

  /**
   * Opens the sprite file
   */
  open_sprite_file() {
    const file_id = this.id;
    const file_system_handler = this.file_area_view.file_system_handler;

    const fileData = file_system_handler.get_file_by_id(file_id);

    if (fileData) {
      if (fileData.type === "png" && fileData.matrix_data) {
        const spriteEditor = this.file_area.editor_tool.sprite_editor;
        spriteEditor.handle_loaded_matrix(fileData.matrix_data);
      } else {
        console.error("Unsupported file type or missing matrix data.");
      }
    } else {
      console.error("Error loading sprite file.");
    }
  }

  /**
   * Adds the file extension to the name for display purposes.
   */
  update_name_field() {
    this.name_field.textContent = `${this.name}.${this.type}`;
  }

  /**
   * Creates an input field for editing the file name, excluding the extension.
   * @returns {HTMLInputElement}
   */
  create_edit_name_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.classList.add("edit-name-input");
    input.value = this.name;
    return input;
  }

  /**
   * Replaces the name field with an input field for renaming.
   * The file extension is not editable.
   */
  replace_name_with_input() {
    this.replaceChild(this.edit_name_input, this.name_field);
    this.edit_name_input.addEventListener("blur", () => {
      this.name = this.edit_name_input.value;
      this.update_name_field();
    });
  }
}

customElements.define("file-item", FileItemView);
