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

  /**
   * Initializes the file item view with custom event listeners
   */
  init() {
    super.init();
  }
}

customElements.define("file-item", FileItemView);
