import { ItemView } from "./ItemView.js";

/**
 * Represents a view for a folder item in the FileAreaView.
 * Extends the base ItemView to customize behavior for folders.
 */
export class FolderItemView extends ItemView {
  /**
   * @param {string} name
   * @param {FileAreaView} file_area_view
   * @param {number} id
   */
  constructor(name, file_area_view, id = -1) {
    super(name, file_area_view, id);

    this.setAttribute("draggable", true);
    this.id = id;
    this.file_area_view = file_area_view;
    this.name = name;
    this.edit_name_input = this.create_edit_name_input();
  }

  /**
   * Creates an icon for the folder
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-folder");
    return icon;
  }

  /**
   * Initializes the folder item view with custom event listeners
   */
  init() {
    super.init();
    this.icon.addEventListener("dblclick", this.open_folder.bind(this));
  }

  open_folder() {
    this.file_area_view.navigate_to_folder(Number(this.id));
  }

  /**
   * Creates an input field for editing the folder name
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
   * Replaces the name field with an input field for renaming
   */
  replace_name_with_input() {
    this.replaceChild(this.edit_name_input, this.name_field);
  }
}

customElements.define("folder-item", FolderItemView);
