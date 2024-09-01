import { ItemView } from "./ItemView.js";

export class FolderItemView extends ItemView {
  /**
   * View-Class of a folder in the FileAreaView
   * @param {String} name
   * @param {FileAreaView} file_area_view
   * @param {number} id
   */
  constructor(name, file_area_view, id) {
    super(name, file_area_view, id);
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

  init() {
    super.init();
    this.icon.addEventListener("dblclick", this.open_folder.bind(this));
  }

  /**
   * Opens the folder when it is double-clicked
   */
  open_folder() {
    this.file_area_view.navigate_to_folder(this.name);
  }

  /**
   * Replaces the name field with an input field for renaming.
   */
  replace_name_with_input() {
    this.replaceChild(this.edit_name_input, this.name_field);
  }
}

customElements.define("folder-item", FolderItemView);
