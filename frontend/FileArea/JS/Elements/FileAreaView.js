import { FileItemView } from "./FileItemView.js";
import { FolderItemView } from "./FolderItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { ContextMenuFactory } from "../Classes/ContextMenu/ContextMenuFactory.js";
import { FileDragHandler } from "../Classes/FileDragHandler.js";

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

    this.context_menu_element = this.create_context_menu_element();
    this.context_menu_factory = new ContextMenuFactory(
      this.file_area,
      this.context_menu_element
    );

    this.css = this.create_css_link();
    this.appendChild(this.css);
    this.appendChild(this.context_menu_element);

    this.drag_handler = new FileDragHandler(this);

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
    this.addEventListener("contextmenu", this.handle_context_menu.bind(this));
    this.addEventListener("click", this.handle_click.bind(this));
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
   * Handles left-clicks to select or deselect items.
   * @param {MouseEvent} event
   */
  handle_click(event) {
    const target = event.target.closest(".item");

    if (target) {
      if (event.ctrlKey && event.button === 0) {
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
   * Toggles the selection state of an item.
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
   * Clears the current selection of items.
   */
  clear_selection() {
    this.selected_items.forEach((item) => item.classList.remove("selected"));
    this.selected_items.clear();
  }

  /**
   * Highlights the selected item and updates the file area selection.
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
   * Handles right-clicks to show the context menu.
   * @param {MouseEvent} event
   */
  handle_context_menu(event) {
    event.preventDefault();
    const target = event.target.closest(".item");
    if (target && !this.selected_items.has(target)) {
      this.select_item(target);
    }
    const context_menu = this.context_menu_factory.getContextMenu(
      this.selected_items
    );
    context_menu.show(event);

    document.addEventListener("click", () => context_menu.hide(), {
      once: true,
    });
  }

  /**
   * Moves the selected items to the specified folder and updates the view.
   * @param {Array<string>} item_ids
   * @param {string} folder_id
   */
  async move_selected_items_to_folder(item_ids, folder_id) {
    await this.file_area.move_items(item_ids, folder_id);
    await this.file_area.file_system_handler.read_directory_content();
  }

  /**
   * Moves selected items to the parent folder ("..").
   * @param {Array<number>} selected_ids
   */
  async move_to_parent_folder(selected_ids) {
    const parent_folder =
      this.file_system_handler.folder_history[
        this.file_system_handler.folder_history.length - 2
      ];

    if (parent_folder && parent_folder.id) {
      const parent_folder_id = parent_folder.id;
      console.log(`Moving items to parent folder ID: ${parent_folder_id}`);
      await this.move_selected_items_to_folder(selected_ids, parent_folder_id);
    } else {
      console.warn("Parent folder not found in folder history.");
    }
  }

  /**
   * Handles the drop action on a folder. Manages the actual logic to move items.
   * @param {Array<number>} selected_ids
   * @param {number} folder_id -
   */
  async handle_drop_on_folder(selected_ids, folder_id) {
    if (selected_ids.includes(folder_id)) {
      console.warn("Cannot drop folder into itself.");
      return;
    }
    await this.move_selected_items_to_folder(selected_ids, folder_id);
  }

  /**
   * Called when the component is added to the DOM.
   */
  connectedCallback() {
    this.file_system_handler = this.file_area.file_system_handler;
    this.file_system_handler.read_directory_content();
  }

  /**
   * Called from the file_system_handler to update the view.
   */
  rebuild_view() {
    this.clear_old_items();

    this.items = this.file_system_handler.entries
      .map((item) => {
        let view_item = null;

        if (item instanceof File) {
          view_item = new FileItemView(item.name, this, item.id);
        } else if (item instanceof Folder) {
          view_item = new FolderItemView(item.name, this, item.id);
        }

        if (view_item) {
          view_item.setAttribute("draggable", "true");
        } else {
          console.warn(`Unrecognized item type:`, item);
        }

        return view_item;
      })
      .filter((item) => item !== null);

    if (this.file_system_handler.folder_history.length > 1) {
      const back_folder = new FolderItemView("..", this);
      back_folder.setAttribute("draggable", "true");
      this.items.unshift(back_folder);
    }

    this.items.forEach((item) => {
      this.appendChild(item);
    });
  }

  /**
   * Removes old items from the DOM.
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
   * Navigates to the double-clicked folder.
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
    const new_folder = new FolderItemView("New Folder", this, null);
    this.appendChild(new_folder);
    return new_folder;
  }

  /**
   * Checks if there are any selected items
   * @returns {boolean}
   */
  has_selected_items() {
    return this.selected_items.size > 0;
  }

  /**
   * Clears the current selection of items
   */
  clear_selection() {
    this.selected_items.forEach((item) => item.classList.remove("selected"));
    this.selected_items.clear();
  }
}

customElements.define("file-area-view", FileAreaView);
