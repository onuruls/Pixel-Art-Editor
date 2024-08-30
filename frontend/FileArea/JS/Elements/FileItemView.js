import { ItemView } from "./ItemView.js";

export class FileItemView extends ItemView {
  /**
   * View-Class of a File in the FileAreaView
   * @param {String} name
   * @param {FileAreaView} file_area_view
   */
  constructor(name, file_area_view) {
    super(name, file_area_view);
  }

  /**
   * Creates an icon for the file
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file");
    return icon;
  }

  init() {
    super.init();
  }
}

customElements.define("file-item", FileItemView);
