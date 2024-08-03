import { ItemView } from "./ItemView.js";

export class FolderItemView extends ItemView {
  constructor(name, file_area_view) {
    super(name, file_area_view);
  }

  /**
   *
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

  open_folder() {
    this.file_area_view.navigate_to_folder(this.name);
  }
}

customElements.define("folder-item", FolderItemView);
