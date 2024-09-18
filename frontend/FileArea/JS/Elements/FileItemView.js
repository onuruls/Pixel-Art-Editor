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
        this.icon.addEventListener("dblclick", this.open_png_file.bind(this));
        break;
      case "tmx":
        //TODO: Implement TMX file opening
        break;
    }
  }

  /**
   * Opens the sprite file
   */
  open_png_file() {
    const file_meta_data = this.file_area.file_system_handler.get_file_by_id(
      this.id
    );
    const file_path = `../../../../uploads/${file_meta_data.name}.png`;
    const file = new File([file_path], `${file_meta_data.name}.png`, {
      type: "image/png",
    });
    switch (this.file_area.selected_editor) {
      case "SpriteEditor":
        this.file_area.editor_tool.sprite_editor.import_from_png(file);
        break;
      case "MapEditor":
        //TODO: Implement map editor
        console.log("Map Editor");
        break;
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
