import { FileSystemHandler } from "../Classes/Service/FileSystemHandler.js";
import { RenameItemHandler } from "../Classes/Handler/RenameItemHandler.js";
import { CreateItemHandler } from "../Classes/Handler/CreateItemHandler.js";
import { FileAreaTools } from "./FileAreaTools.js";
import { FileAreaView } from "./FileAreaView.js";
import { FolderItemView } from "./FolderItemView.js";
import { FileItemView } from "./FileItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";

export class FileArea extends HTMLElement {
  /**
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.file_system_handler = null;
    this.operation_in_progress = false;
    this.selected_editor = "SpriteEditor";

    this.css = this.create_css_link();
    this.appendChild(this.css);

    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaTools(this);

    this.appendChild(this.file_view);
    this.appendChild(this.file_tools_right);
  }

  /**
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", "../FileArea/CSS/Elements/FileArea.css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   * From HTMLElement - called when mounted to DOM.
   */
  async connectedCallback() {
    this.file_system_handler = new FileSystemHandler(
      this.file_view,
      this.editor_tool.project
    );

    await this.file_system_handler.read_directory_content();

    this.rename_handler = new RenameItemHandler(
      this.file_system_handler,
      this.file_view
    );
    this.create_handler = new CreateItemHandler(
      this.file_system_handler,
      this.file_view
    );

    this.file_view.rebuild_view();

    this.set_listeners();
    this.set_global_click_listener();
  }

  /**
   * Initializes all event listeners.
   */
  set_listeners() {}

  /**
   * Sets a global click listener to deselect all items.
   */
  set_global_click_listener() {
    this.global_click_listener = (event) => this.handle_global_click(event);
    document.addEventListener("click", this.global_click_listener);
  }

  /**
   * Handles the global click event to deselect items.
   * @param {MouseEvent} event
   */
  handle_global_click(event) {
    const is_click_inside =
      this.contains(event.target) && event.target.closest(".item") !== null;
    if (
      !is_click_inside &&
      this.file_view.selection_handler.has_selected_items()
    ) {
      this.file_view.selection_handler.clear_selection();
    }
  }

  /**
   * Creates a new folder or file element using the CreateItemHandler.
   * If no file type is specified, it defaults to creating a folder.
   * @param {string} fileType
   */
  async create_new_item(fileType = "folder") {
    await this.create_handler.create_new_item(fileType);
  }

  /**
   * General method to rename selected items (both files and folders).
   */
  async rename_selected_items() {
    if (this.file_view.selection_handler.selected_items.size === 1) {
      const selected_item = Array.from(
        this.file_view.selection_handler.selected_items
      )[0];
      const id = this.get_selected_item_id(selected_item);
      const item = this.get_item_by_type(selected_item);

      if (item) {
        this.rename_handler.start_rename(item, selected_item);
      }
    } else {
      console.warn("Please select a single item to rename.");
    }
  }

  /**
   * General method to delete selected items (both files and folders).
   */
  async delete_selected_items() {
    const selected_items = Array.from(
      this.file_view.selection_handler.selected_items
    );

    if (selected_items.length > 0) {
      await Promise.all(
        selected_items.map(async (selected_item) => {
          const id = this.get_selected_item_id(selected_item);
          const item = this.get_item_by_type(selected_item);

          if (item instanceof Folder) {
            await this.file_system_handler.delete_folder_by_id(id);
          } else if (item instanceof File) {
            await this.file_system_handler.delete_file_by_id(id);
          } else {
            console.warn("Unknown item type:", item);
          }
          selected_item.remove();
        })
      );
    } else {
      console.warn("No items selected to delete.");
    }
    this.file_system_handler.read_directory_content();
  }

  /**
   * Moves selected items (both files and folders) to a target folder.
   * @param {number} target_folder_id
   */
  async move_selected_items_to_folder(target_folder_id) {
    const { selected_items } = this.file_view.selection_handler;

    for (const item of selected_items) {
      if (item instanceof FolderItemView) {
        await this.file_system_handler.move_folder_by_id(
          item.id,
          target_folder_id
        );
      } else if (item instanceof FileItemView) {
        await this.file_system_handler.move_file_by_id(
          item.id,
          target_folder_id
        );
      }
    }
    this.file_system_handler.read_directory_content();
  }

  /**
   * Gets the ID of the selected item.
   * @param {ItemView} selected_item
   * @returns {number}
   */
  get_selected_item_id(selected_item) {
    return Number(selected_item.id);
  }

  /**
   * Gets the item (folder or file) based on its type (FolderItemView or FileItemView).
   * @param {ItemView} selected_item
   * @returns {Folder|File}
   */
  get_item_by_type(selected_item) {
    const id = this.get_selected_item_id(selected_item);

    if (selected_item instanceof FolderItemView) {
      return this.file_system_handler.get_folder_by_id(id);
    } else if (selected_item instanceof FileItemView) {
      return this.file_system_handler.get_file_by_id(id);
    }

    return null;
  }
}

customElements.define("file-area", FileArea);
