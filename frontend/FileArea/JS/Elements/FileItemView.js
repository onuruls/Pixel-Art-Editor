import { ItemView } from "./ItemView.js";

export class FileItemView extends ItemView {
  /**
   * View-Class of a File in the FileAreaView
   * @param {String} name
   * @param {FileAreaView} file_area_view
   * @param {number} id
   */
  constructor(name, file_area_view, id) {
    super(name, file_area_view, id);
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
