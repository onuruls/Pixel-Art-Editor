import { FileDragHandler } from "../Classes/FileDragHandler.js";
import { FileSelectionHandler } from "../Classes/FileSelectionHandler.js";
import { FileContextMenuHandler } from "../Classes/FileContextMenuHandler.js";
import { ContextMenuFactory } from "../Classes/ContextMenu/ContextMenuFactory.js";
import { FolderItemView } from "../Elements/FolderItemView.js";
import { FileItemView } from "../Elements/FileItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";

export class FileAreaView extends HTMLElement {
  /**
   * The view of the folders and files in the FileArea
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
    this.items = [];
    this.context_menu_element = this.create_context_menu_element();
    this.css = this.create_css_link();

    // Initialize the context menu factory
    this.context_menu_factory = new ContextMenuFactory(
      this.file_area,
      this.context_menu_element
    );

    this.drag_handler = new FileDragHandler(this);
    this.selection_handler = new FileSelectionHandler(this);
    this.context_menu_handler = new FileContextMenuHandler(this);

    this.appendChild(this.css);
    this.appendChild(this.context_menu_element);
    this.init();
  }

  /**
   * Creates the CSS link element for the view.
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
   * Creates the context menu element for the view.
   * @returns {HTMLElement}
   */
  create_context_menu_element() {
    const menu_element = document.createElement("div");
    menu_element.classList.add("context-menu");
    return menu_element;
  }

  /**
   * Initializes event listeners.
   */
  init() {
    this.addEventListener(
      "contextmenu",
      this.context_menu_handler.handle_context_menu.bind(
        this.context_menu_handler
      )
    );
    this.addEventListener(
      "click",
      this.selection_handler.handle_click.bind(this.selection_handler)
    );
    this.addEventListener(
      "dragstart",
      this.drag_handler.handle_drag_start.bind(this.drag_handler)
    );
    this.addEventListener(
      "dragover",
      this.drag_handler.handle_drag_over.bind(this.drag_handler)
    );
    this.addEventListener(
      "drop",
      this.drag_handler.handle_drop.bind(this.drag_handler)
    );
  }

  /**
   * Rebuilds the view to reflect current directory content.
   */
  rebuild_view() {
    this.clear_old_items();

    this.items = this.file_area.file_system_handler.entries
      .map((item) => this.create_view_item(item))
      .filter((item) => item !== null);

    if (this.file_area.file_system_handler.folder_history.length > 1) {
      const back_folder = new FolderItemView("..", this);
      this.items.unshift(back_folder);
    }

    this.items.forEach((item) => {
      this.appendChild(item);
    });
  }

  /**
   * Creates a view item (file or folder).
   * @param {File|Folder} item
   * @returns {HTMLElement|null}
   */
  create_view_item(item) {
    if (item instanceof File) {
      return new FileItemView(item.name, this, item.id);
    } else if (item instanceof Folder) {
      return new FolderItemView(item.name, this, item.id);
    }
    return null;
  }

  /**
   * Clears old items from the DOM.
   */
  clear_old_items() {
    this.items.forEach((item) => {
      if (item && item.parentNode) {
        item.remove();
      }
    });
    this.items = [];
  }

  /**
   * Creates a new folder element.
   * @returns {FolderItemView}
   */
  create_new_folder() {
    const new_folder = new FolderItemView("New Folder", this, null);
    this.items.push(new_folder);
    this.appendChild(new_folder);
    return new_folder;
  }

  /**
   * Navigates to the folder by its ID.
   * @param {number|string} folder_id
   */
  navigate_to_folder(folder_id) {
    console.log("Navigation fortgeführt mit:", folder_id);
    this.file_area.file_system_handler.change_directory_handle(folder_id);
  }
}

customElements.define("file-area-view", FileAreaView);
