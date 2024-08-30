import { ItemView } from "./ItemView.js";

export class FolderItemView extends ItemView {
  /**
   * View-Class of a folder in the FileAreaView
   * @param {String} name
   * @param {FileAreaView} file_area_view
   */
  constructor(name, file_area_view) {
    super(name, file_area_view);
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
}

customElements.define("folder-item", FolderItemView);
