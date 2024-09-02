import { FileItemView } from "./FileItemView.js";
import { FolderItemView } from "./FolderItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { ContextMenuFactory } from "./Classes/ContextMenu/ContextMenuFactory.js";

export class FileAreaView extends HTMLElement {
  /**
   * The view of the folders and files in the FileArea
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;

    this.items = [];
    this.selected_items = new Set();

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
   * @returns {HTMLElement}
   */
  createContextMenuElement() {
    const menu_element = document.createElement("div");
    menu_element.classList.add("context-menu");
    return menu_element;
  }
  /**
   * Called by upper class
   */
  init() {
    this.addEventListener("contextmenu", this.handleContextMenu.bind(this));
    this.addEventListener("click", this.handleClick.bind(this));
  }

  /**
   * Handles left-clicks to select or deselect items
   * Clears selection if the click is outside of any item
   * @param {MouseEvent} event
   */
  handleClick(event) {
    const target = event.target.closest(".item");

    if (target) {
      if (event.ctrlKey && event.button === 0) {
        // Ctrl + Left Click
        this.toggle_item_selection(target);
      } else {
        this.clear_selection();
        this.select_item(target);
      }
    } else {
      this.clear_selection();
    }
  }

  /**
   * Toggles the selection state of an item
   * @param {HTMLElement} target
   */
  toggle_item_selection(target) {
    if (this.selected_items.has(target)) {
      this.selected_items.delete(target);
      target.classList.remove("selected");
    } else {
      this.selected_items.add(target);
      target.classList.add("selected");
    }
  }

  /**
   * Clears the current selection of items
   */
  clear_selection() {
    this.selected_items.forEach((item) => item.classList.remove("selected"));
    this.selected_items.clear();
  }

  /**
   * Highlights the selected item and updates the file area selection
   * @param {HTMLElement} target
   */
  select_item(target) {
    const id = target.getAttribute("data-id");
    if (id === "undefined") {
      return;
    }
    this.selected_items.add(target);
    target.classList.add("selected");
    this.file_area.selected_items = this.selected_items;
  }

  /**
   * Handles right-clicks to show the context menu
   * @param {MouseEvent} event
   */
  handleContextMenu(event) {
    event.preventDefault();
    const target = event.target.closest(".item");
    if (target && !this.selected_items.has(target)) {
      this.select_item(target);
    }
    const context_menu = this.contextMenuFactory.getContextMenu(
      this.selected_items
    );
    context_menu.show(event);

    document.addEventListener("click", () => context_menu.hide(), {
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
   * Called form the file_system_handler
   * Updates the view
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
   * Removes the old items from the DOM.
   */
  clear_old_items() {
    for (const item of this.items) {
      item.remove();
    }
  }

  /**
   * Navigates to the dblclicked folder
   * when file_system_handler is done, FileAreaView will
   * be updated
   * @param {String} name
   */
  navigate_to_folder(name) {
    this.clear_selection();
    this.file_system_handler.change_directory_handle(name);
  }

  /**
   * Creates a new folder item view and returns it.
   * @returns {FolderItemView}
   */
  create_new_folder() {
    const newFolder = new FolderItemView("New Folder", this, null);
    this.appendChild(newFolder);
    return newFolder;
  }
}

customElements.define("file-area-view", FileAreaView);
