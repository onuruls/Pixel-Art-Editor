import { FileSystemHandler } from "./Classes/FileSystemHandler.js";
import { FileArea } from "./FileArea.js";
import { FileItem } from "./FileItem.js";
import { FolderItem } from "./FolderItem.js";
import { Item } from "./Item.js";

export class FileAreaView extends HTMLElement {
  /**
   *
   * @param {FileArea} file_area
   * @param {FileSystemHandler} file_system_handler
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
    this.file_system_handler = null;
    this.items = [];
    this.directory_content = [];
    this.selected_item = null;
    this.css = this.create_css_link();
    this.appendChild(this.css);
    this.init();
  }

  /**
   *
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", `../FileArea/CSS/Elements/FileAreaView.css`);
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   *
   * @param {Array<Object>} dir_content
   */
  update_view(dir_content) {
    dir_content.forEach((entry) => console.log(entry));
  }

  /**
   * Called by upper class
   */
  init() {}

  connectedCallback() {
    this.file_system_handler = new FileSystemHandler(
      this,
      this.file_area.editor_tool.dir_handler
    );
  }

  /**
   * Called form the file_system_handler when Promises are resolved
   * Updates the view
   */
  rebuild_view() {
    this.clear_old_items();
    this.items = this.file_system_handler.entries.map((item) => {
      if (item.kind === "file") {
        return new FileItem(item.name, this);
      } else if (item.kind === "directory") {
        return new FolderItem(item.name, this);
      }
    });
    if (this.file_system_handler.fsd_histroy.length > 1) {
      this.items.unshift(new FolderItem("..", this));
    }
    this.items.forEach((item) => {
      item.addEventListener("click", this.select_item.bind(this));
      this.appendChild(item);
    });
  }

  /**
   * Removes the old items from the DOM
   */
  clear_old_items() {
    for (const item of this.items) {
      item.remove();
    }
  }

  /**
   * Highlights the selected item
   * @param {Event} event
   */
  select_item(event) {
    const target =
      event.target instanceof Item ? event.target : event.target.parentNode;
    this.selected_item?.classList.remove("selected");
    this.selected_item = target;
    this.selected_item.classList.add("selected");
  }

  /**
   * Navigates to the dblclicked folder
   * when file_system_handler is done, FileAreaView will
   * be updated
   * @param {String} name
   */
  navigate_to_folder(name) {
    this.file_system_handler.change_directory_handle(name);
  }
}

customElements.define("file-area-view", FileAreaView);
