import { FileSystemHandler } from "./Classes/FileSystemHandler.js";
import { TopMenu } from "./TopMenu.js";
import { FileAreaTools } from "./FileAreaTools.js";
import { FileAreaView } from "./FileAreaView.js";
import { FolderItemView } from "./FolderItemView.js";

export class FileArea extends HTMLElement {
  /**
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.file_system_handler = null;
    this.operation_in_progress = false;

    this.css = this.create_css_link();
    this.appendChild(this.css);

    this.file_tools_left = new TopMenu(this);
    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaTools(this);

    this.appendChild(this.file_tools_left);
    this.appendChild(this.file_view);
    this.appendChild(this.file_tools_right);

    this.init();
  }

  /**
   *
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
   * Initializes the tool listeners.
   */
  init() {}

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.file_system_handler = new FileSystemHandler(
      this.file_view,
      this.editor_tool.project
    );
    this.set_listeners();
    this.set_global_click_listener();
  }

  /**
   * Called when the component is removed from the DOM
   */
  disconnectedCallback() {
    document.removeEventListener("click", this.global_click_listener);
  }

  /**
   * Initializes all event listeners
   */
  set_listeners() {}

  /**
   * Sets a global click listener to deselect all items
   */
  set_global_click_listener() {
    this.global_click_listener = (event) => this.handle_global_click(event);
    document.addEventListener("click", this.global_click_listener);
  }

  /**
   * Handles the global click event to deselect items
   * @param {MouseEvent} event
   */
  handle_global_click(event) {
    const is_click_inside =
      this.contains(event.target) && event.target.closest(".item") !== null;
    if (!is_click_inside && this.file_view.selected_items.size > 0) {
      this.file_view.clear_selection();
    }
  }

  /**
   * Creates a new folder element in the file view
   * The folder includes an image, and an input field for the folder name
   */
  create_new_folder() {
    if (this.operation_in_progress) return;

    const new_folder = new FolderItemView("New Folder", this.file_view, null);
    this.replace_name_with_input(new_folder);
    this.file_view.appendChild(new_folder);
    new_folder.edit_name_input.focus();

    const handleCreate = async () => {
      if (this.operation_in_progress) return;
      this.operation_in_progress = true;

      await this.handle_create_folder(new_folder);

      new_folder.edit_name_input.removeEventListener("blur", handleCreate);
      new_folder.edit_name_input.removeEventListener(
        "keypress",
        handleKeyPress
      );

      this.operation_in_progress = false;
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleCreate();
      }
    };

    new_folder.edit_name_input.addEventListener("blur", handleCreate);
    new_folder.edit_name_input.addEventListener("keypress", handleKeyPress);
  }

  /**
   * Handles the folder creation process
   * @param {FolderItemView} new_folder
   */
  async handle_create_folder(new_folder) {
    const folderName = new_folder.edit_name_input.value.trim();
    if (folderName) {
      try {
        await this.file_system_handler.create_folder(folderName);
        new_folder.remove();
        this.file_view.rebuild_view();
      } catch (error) {
        console.error("Failed to create folder:", error);
        new_folder.remove();
      }
    } else {
      new_folder.remove();
    }
  }

  /**
   * Deletes the selected folders
   */
  delete_selected_folder() {
    this.delete_selected_items((id) =>
      this.file_system_handler.delete_folder_by_id(id)
    );
  }

  /**
   * Deletes the selected files
   */
  delete_selected_file() {
    this.delete_selected_items((id) =>
      this.file_system_handler.delete_file_by_id(id)
    );
  }

  /**
   * Deletes the selected items based on the provided delete method
   * @param {Function} deleteMethod
   */
  delete_selected_items(deleteMethod) {
    const items_to_delete = Array.from(this.file_view.selected_items);

    const delete_promises = items_to_delete.map((selected_item) => {
      const id = this.get_selected_item_id(selected_item);
      const item = this.get_item_by_id(id);

      if (item) {
        return deleteMethod(id)
          .then(() => {
            this.remove_item_from_view(selected_item);
            this.remove_item_from_entries(id);
          })
          .catch((error) => {
            console.error("Failed to delete the item from the server:", error);
          });
      }
    });
  }

  /**
   * Gets the ID of the selected item
   * @param {HTMLElement} selected_item
   * @returns {number}
   */
  get_selected_item_id(selected_item) {
    return parseInt(selected_item.getAttribute("data-id"), 10);
  }

  /**
   * Gets an item from the file system handler by ID
   * @param {number} id
   * @returns {Object}
   */
  get_item_by_id(id) {
    return this.file_system_handler.entries.find((entry) => entry.id === id);
  }

  /**
   * Removes the selected item from the view
   * @param {HTMLElement} selected_item
   */
  remove_item_from_view(selected_item) {
    selected_item.remove();
  }

  /**
   * Removes an item from the file system handler's entries by ID
   * @param {number} id
   */
  remove_item_from_entries(id) {
    const item_index = this.file_system_handler.entries.findIndex(
      (entry) => entry.id === id
    );
    if (item_index !== -1) {
      this.file_system_handler.entries.splice(item_index, 1);
    }
  }

  /**
   * Renames the first selected folder or file
   */
  rename_selected_folder() {
    if (this.file_view.selected_items.size === 1) {
      const selected_item = Array.from(this.file_view.selected_items)[0];
      const id = this.get_selected_item_id(selected_item);
      const item = this.get_item_by_id(id);

      if (item) {
        this.initiate_rename(item, selected_item);
      }
    } else {
      console.warn("Please select a single folder or file to rename.");
    }
  }

  /**
   * Initiates the renaming process by replacing the text element with an input field
   * @param {Object} item
   * @param {HTMLElement} selected_item
   */
  initiate_rename(item, selected_item) {
    if (this.operation_in_progress) return;
    const p_element = selected_item.querySelector("p");
    const original_name = item.name;

    const input_field = this.create_rename_input(original_name);
    selected_item.replaceChild(input_field, p_element);
    input_field.focus();

    const handleRename = async () => {
      if (this.operation_in_progress) return;
      this.operation_in_progress = true;

      input_field.removeEventListener("blur", handleRename);
      input_field.removeEventListener("keypress", handleKeyPress);

      this.handle_rename(input_field, p_element, item, original_name);

      this.operation_in_progress = false;
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleRename();
      }
    };

    input_field.addEventListener("blur", handleRename);
    input_field.addEventListener("keypress", handleKeyPress);
  }

  /**
   * Creates an input field for renaming or folder creation
   * @param {string} value
   * @returns {HTMLInputElement}
   */
  create_rename_input(value) {
    const input_field = document.createElement("input");
    input_field.type = "text";
    input_field.value = value;
    input_field.classList.add("rename-input");

    setTimeout(() => {
      input_field.select();
    }, 0);

    return input_field;
  }

  /**
   * Handles the renaming of an item
   * @param {HTMLInputElement} input_field
   * @param {HTMLElement} p_element
   * @param {Object} item
   * @param {string} original_name
   */
  handle_rename(input_field, p_element, item, original_name) {
    const new_name = input_field.value.trim();

    setTimeout(async () => {
      if (new_name && new_name !== original_name) {
        try {
          await this.file_system_handler.rename_folder_by_id(item.id, new_name);

          item.name = new_name;
          p_element.textContent = new_name;

          const folder_item_view = Array.from(this.selected_items)[0];
          if (folder_item_view) {
            folder_item_view.name = new_name;
          }
          await this.file_system_handler.read_directory_content();
        } catch (error) {
          console.error("Failed to rename the item on the server:", error);
          p_element.textContent = original_name;
        }
      } else {
        p_element.textContent = original_name;
      }
      input_field.replaceWith(p_element);
      this.operation_in_progress = false;
    }, 0);
  }

  /**
   * Replaces the name field with an input field
   * @param {FolderItemView} folder_item_view
   */
  replace_name_with_input(folder_item_view) {
    const input_field = this.create_rename_input(folder_item_view.name);
    folder_item_view.name_field.replaceWith(input_field);
    folder_item_view.edit_name_input = input_field;
  }
}

customElements.define("file-area", FileArea);
