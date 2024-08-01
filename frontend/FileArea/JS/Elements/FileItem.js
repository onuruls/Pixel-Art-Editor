import { Item } from "./Item.js";

export class FileItem extends Item {
  constructor(name, file_area_view) {
    super(name, file_area_view);
  }

  /**
   *
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

customElements.define("file-item", FileItem);
