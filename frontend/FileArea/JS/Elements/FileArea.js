import { FileSystemHandler } from "../Classes/Service/FileSystemHandler.js";
import { RenameItemHandler } from "../Classes/Handler/RenameItemHandler.js";
import { CreateItemHandler } from "../Classes/Handler/CreateItemHandler.js";
import { FileAreaTools } from "./FileAreaTools.js";
import { FileAreaView } from "./FileAreaView.js";
import { FolderItemView } from "./FolderItemView.js";
import { FileItemView } from "./FileItemView.js";
import { Folder } from "../../../EditorTool/JS/Classes/Folder.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";

export class FileArea extends HTMLElement {
  /**
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;

    this.appendChild(this.create_css_link());

    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaTools(this);

    this.append(this.file_view, this.file_tools_right);
  }

  create_css_link() {
    const css = document.createElement("link");
    css.href = "../FileArea/CSS/Elements/FileArea.css";
    css.rel = "stylesheet";
    css.type = "text/css";
    return css;
  }

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

    this.file_view.addEventListener(
      "itemRenamed",
      this.handle_item_renamed.bind(this)
    );

    this.set_global_click_listener();
  }

  disconnectedCallback() {
    this.file_view.removeEventListener("itemRenamed", this.handle_item_renamed);
    document.removeEventListener("click", this.global_click_listener);
  }

  /**
   * Sets a global click listener to deselect all items.
   */
  set_global_click_listener() {
    this.global_click_listener = this.handle_global_click.bind(this);
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
   * Opens the file with the given ID.
   * @param {number} file_id
   */
  async open_file(file_id) {
    if (!this.file_system_handler) {
      console.error("File system handler is not initialized yet.");
      return;
    }

    const file_data = this.file_system_handler.get_file_by_id(file_id);
    if (file_data) {
      if (["png", "tmx"].includes(file_data.type)) {
        this.editor_tool.set_active_file(file_data);
      } else {
        console.error("Unsupported file type or missing data.");
      }
    } else {
      console.error("Error loading file.");
    }
  }

  /**
   * Creates a new item (folder or file).
   * @param {string} file_type
   */
  async create_new_item(file_type = "folder") {
    await this.create_handler.create_new_item(file_type);
  }

  /**
   * Renames the selected item.
   */
  async rename_selected_items() {
    const selected_item =
      Array.from(this.file_view.selection_handler.selected_items)[0] || null;
    if (selected_item) {
      const item = this.get_item_by_type(selected_item);
      if (item) {
        this.rename_handler.start_rename(item, selected_item, (new_name) => {});
      }
    } else {
      console.warn("Please select a single item to rename.");
    }
  }

  /**
   * Handles the item renamed event to update top menu
   * @param {CustomEvent} event
   */
  handle_item_renamed(event) {
    const renamed_item = event.detail.item;
    if (
      this.editor_tool.active_file &&
      this.editor_tool.active_file.id === renamed_item.id
    ) {
      this.editor_tool.top_menu.update_file_name(renamed_item.name);
    }
  }

  /**
   * Deletes the selected items.
   */
  async delete_selected_items() {
    const selected_items = Array.from(
      this.file_view.selection_handler.selected_items
    );

    if (selected_items.length > 0) {
      await Promise.all(
        selected_items.map(async (selected_item) => {
          const item = this.get_item_by_type(selected_item);

          if (item instanceof Folder) {
            await this.file_system_handler.delete_folder_by_id(item.id);
          } else if (item instanceof File) {
            await this.file_system_handler.delete_file_by_id(item.id);
          } else {
            console.warn("Unknown item type:", item);
          }

          if (
            this.editor_tool.active_file &&
            (selected_item.id == this.editor_tool.active_file.id ||
              selected_item.id == this.editor_tool.active_file.folder_id)
          ) {
            this.editor_tool.handle_no_file();
          }

          selected_item.remove();
        })
      );
    } else {
      console.warn("No items selected to delete.");
    }
    await this.file_system_handler.read_directory_content();
  }

  /**
   * Moves selected items to a target folder.
   * @param {number} target_folder_id
   */
  async move_selected_items_to_folder(target_folder_id) {
    const selected_items = Array.from(
      this.file_view.selection_handler.selected_items
    );

    for (const selected_item of selected_items) {
      const item = this.get_item_by_type(selected_item);

      if (item instanceof Folder) {
        await this.file_system_handler.move_folder_by_id(
          item.id,
          target_folder_id
        );
      } else if (item instanceof File) {
        await this.file_system_handler.move_file_by_id(
          item.id,
          target_folder_id
        );
      } else {
        console.warn("Unknown item type:", item);
      }
    }
    await this.file_system_handler.read_directory_content();
  }

  /**
   * Gets the item (folder or file) based on its type.
   * @param {ItemView} selected_item
   * @returns {Folder|File|null}
   */
  get_item_by_type(selected_item) {
    const id = Number(selected_item.id);

    if (selected_item instanceof FolderItemView) {
      return this.file_system_handler.get_folder_by_id(id);
    } else if (selected_item instanceof FileItemView) {
      return this.file_system_handler.get_file_by_id(id);
    }

    return null;
  }
}

customElements.define("file-area", FileArea);
