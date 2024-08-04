import { File } from "../../../EditorTool/JS/Classes/File.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { FileArea } from "./FileArea.js";
import { FileItemView } from "./FileItemView.js";
import { FolderItemView } from "./FolderItemView.js";
import { ItemView } from "./ItemView.js";

export class FileAreaView extends HTMLElement {
  /**
   *
   * @param {FileArea} file_area
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
   * Called by upper class
   */
  init() {}

  connectedCallback() {
    this.file_system_handler = this.file_area.file_system_handler;
    this.file_system_handler.read_directory_content();
  }

  /**
   * Called form the file_system_handler
   * Updates the view
   */
  rebuild_view() {
    this.clear_old_items();
    this.items = this.file_system_handler.entries.map((item) => {
      if (item instanceof File) {
        return new FileItemView(item.name, this);
      } else if (item instanceof Folder) {
        return new FolderItemView(item.name, this);
      }
    });
    if (this.file_system_handler.folder_history.length > 1) {
      this.items.unshift(new FolderItemView("..", this));
    }
    this.items.forEach((item) => {
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
      event.target instanceof ItemView ? event.target : event.target.parentNode;
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
