import { FileItemView } from "./FileItemView.js";
import { FolderItemView } from "./FolderItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { ContextMenuFactory } from "./Classes/ContextMenu/ContextMenuFactory.js";

export class FileAreaView extends HTMLElement {
  constructor(file_area) {
    super();
    this.file_area = file_area;

    this.items = [];
    this.selected_item = null;

    this.contextMenuElement = this.createContextMenuElement();

    this.contextMenuFactory = new ContextMenuFactory(
      this.file_area,
      this.contextMenuElement
    );

    this.css = this.create_css_link();
    this.appendChild(this.css);
    this.appendChild(this.contextMenuElement);
    this.init();
  }

  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", `../FileArea/CSS/Elements/FileAreaView.css`);
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  createContextMenuElement() {
    const menuElement = document.createElement("div");
    menuElement.classList.add("context-menu");
    return menuElement;
  }

  init() {
    this.addEventListener("contextmenu", this.handleContextMenu.bind(this));
  }

  handleContextMenu(event) {
    event.preventDefault();
    const target = event.target.closest(".item");

    if (target) {
      this.select_item(target);
    }

    const contextMenu = this.contextMenuFactory.getContextMenu(target);
    contextMenu.show(event);

    document.addEventListener("click", () => contextMenu.hide(), {
      once: true,
    });
  }

  /**
   * Called when the component is added to the DOM
   */
  connectedCallback() {
    this.file_system_handler = this.file_area.file_system_handler;
    this.file_system_handler.read_directory_content();
  }

  /**
   * Called by the file_system_handler to update the view
   */
  rebuild_view() {
    this.clear_old_items();
    this.items = this.file_system_handler.entries.map((item) => {
      console.log(item);
      if (item instanceof File) {
        return new FileItemView(item.name, this, item.id);
      } else if (item instanceof Folder) {
        return new FolderItemView(item.name, this, item.id);
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
   * @param {HTMLElement} target
   */
  select_item(target) {
    this.selected_item = target;
    this.file_area.selected_item = this.selected_item;
  }

  /**
   * Navigates to the double-clicked folder
   * when file_system_handler is done, FileAreaView will
   * be updated
   * @param {String} name
   */
  navigate_to_folder(name) {
    this.file_system_handler.change_directory_handle(name);
  }

  /**
   * Creates a new folder item view and returns it
   * @returns {FolderItemView}
   */
  create_new_folder() {
    const newFolder = new FolderItemView("New Folder", this, null);
    this.appendChild(newFolder);
    return newFolder;
  }
}

customElements.define("file-area-view", FileAreaView);
