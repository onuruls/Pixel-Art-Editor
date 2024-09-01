import { FileSystemHandler } from "./Classes/FileSystemHandler.js";
import { FileAreaToolsLeft } from "./FileAreaToolsLeft.js";
import { FileAreaToolsRight } from "./FileAreaToolsRight.js";
import { FileAreaView } from "./FileAreaView.js";
import { FolderItemView } from "./FolderItemView.js";

export class FileArea extends HTMLElement {
  /**
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_item = null;
    this.file_system_handler = null;
    this.folder_creation_in_progress = false;

    this.css = this.create_css_link();
    this.appendChild(this.css);

    this.file_tools_left = new FileAreaToolsLeft(this);
    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaToolsRight(this);

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
   * initializes the tool listeners
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
   * Called when the component is removed from the DOM.
   */
  disconnectedCallback() {
    document.removeEventListener("click", this.global_click_listener);
  }

  /**
   * Initializes all event listeners.
   */
  set_listeners() {}

  /**
   * Sets a global click listener to deselect the folder.
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
    const isClickInside =
      this.contains(event.target) && event.target.closest(".folder") !== null;
    if (!isClickInside && this.selected_item) {
      this.deselect_item();
    }
  }

  /**
   * Deselects the currently selected item.
   */
  deselect_item() {
    if (this.selected_item) {
      this.selected_item.classList.remove("selected-folder");
      this.selected_item = null;
    }
  }

  /**
   * Creates a new folder element in the file view.
   * The folder includes an image, and an input field for the folder name.
   */
  create_new_folder() {
    if (this.folder_creation_in_progress) return;

    const newFolder = new FolderItemView("New Folder", this.file_view, null);
    this.replace_name_with_input(newFolder);
    this.file_view.appendChild(newFolder);
    newFolder.edit_name_input.focus();

    const handleCreate = async () => {
      if (this.folder_creation_in_progress) return;
      this.folder_creation_in_progress = true;

      await this.handle_create_folder(newFolder);

      newFolder.edit_name_input.removeEventListener("blur", handleCreate);
      newFolder.edit_name_input.removeEventListener("keypress", handleKeyPress);

      this.folder_creation_in_progress = false;
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleCreate();
      }
    };

    newFolder.edit_name_input.addEventListener("blur", handleCreate);
    newFolder.edit_name_input.addEventListener("keypress", handleKeyPress);
  }

  /**
   * Handles the folder creation process.
   * @param {FolderItemView} newFolder
   */
  async handle_create_folder(newFolder) {
    const folderName = newFolder.edit_name_input.value.trim();
    if (folderName) {
      try {
        await this.file_system_handler.create_folder(folderName);
        newFolder.remove();
        this.file_view.rebuild_view();
      } catch (error) {
        console.error("Failed to create folder:", error);
        newFolder.remove();
      }
    } else {
      newFolder.remove();
    }
  }

  /**
   * Deletes the selected folder.
   */
  delete_selected_folder() {
    this.delete_selected_item((id) =>
      this.file_system_handler.delete_folder_by_id(id)
    );
  }

  /**
   * Deletes the selected file.
   */
  delete_selected_file() {
    this.delete_selected_item((id) =>
      this.file_system_handler.delete_file_by_id(id)
    );
  }

  /**
   * Deletes the selected item based on the provided delete method.
   * @param {Function} deleteMethod
   */
  delete_selected_item(deleteMethod) {
    if (this.selected_item) {
      const id = this.get_selected_item_id();
      const selected_item = this.selected_item;
      const item = this.get_item_by_id(id);

      if (item) {
        deleteMethod(id)
          .then(() => {
            this.remove_item_from_view(selected_item);
            this.remove_item_from_entries(id);
            this.selected_item = null;
          })
          .catch((error) => {
            console.error("Failed to delete the item from the server:", error);
          });
      }
    }
  }

  /**
   * Gets the ID of the selected item.
   * @returns {number}
   */
  get_selected_item_id() {
    return parseInt(this.selected_item.getAttribute("data-id"), 10);
  }

  /**
   * Gets an item from the file system handler by ID.
   * @param {number} id
   * @returns {Object}
   */
  get_item_by_id(id) {
    return this.file_system_handler.entries.find((entry) => entry.id === id);
  }

  /**
   * Removes the selected item from the view.
   * @param {HTMLElement} selected_item
   */
  remove_item_from_view(selected_item) {
    selected_item.remove();
  }

  /**
   * Removes an item from the file system handler's entries by ID.
   * @param {number} id
   */
  remove_item_from_entries(id) {
    const itemIndex = this.file_system_handler.entries.findIndex(
      (entry) => entry.id === id
    );
    if (itemIndex !== -1) {
      this.file_system_handler.entries.splice(itemIndex, 1);
    }
  }

  /**
   * Renames the selected folder or file.
   */
  rename_selected_folder() {
    if (this.selected_item) {
      const id = this.get_selected_item_id();
      const selected_item = this.selected_item;
      const item = this.get_item_by_id(id);

      if (item) {
        this.initiate_rename(item, selected_item);
      }
    } else {
      console.warn("No folder or file selected to rename.");
    }
  }

  /**
   * Initiates the renaming process by replacing the text element with an input field.
   * @param {Object} item
   * @param {HTMLElement} selected_item
   */
  initiate_rename(item, selected_item) {
    const pElement = selected_item.querySelector("p");
    const originalName = item.name;

    const inputField = this.create_rename_input(originalName);
    selected_item.replaceChild(inputField, pElement);
    inputField.focus();

    inputField.addEventListener("blur", () =>
      this.handle_rename(inputField, pElement, item, originalName)
    );

    inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.handle_rename(inputField, pElement, item, originalName);
      }
    });
  }

  /**
   * Creates an input field for renaming or folder creation.
   * @param {string}
   * @returns {HTMLInputElement}
   */
  create_rename_input(value) {
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = value;
    inputField.classList.add("rename-input");

    setTimeout(() => {
      inputField.select();
    }, 0);

    return inputField;
  }

  /**
   * Handles the renaming of an item.
   * @param {HTMLInputElement} inputField
   * @param {HTMLElement} pElement
   * @param {Object} item
   * @param {string} originalName
   */
  handle_rename(inputField, pElement, item, originalName) {
    const newName = inputField.value.trim();
    if (newName && newName !== originalName) {
      this.file_system_handler
        .rename_folder_by_id(item.id, newName)
        .then(() => {
          item.name = newName;
          pElement.textContent = newName;
        })
        .catch((error) => {
          console.error("Failed to rename the item on the server:", error);
          pElement.textContent = originalName;
        });
    } else {
      pElement.textContent = originalName;
    }
    inputField.replaceWith(pElement);
  }

  /**
   * Replaces the name field with an input field.
   * @param {FolderItemView} folderItemView -
   */
  replace_name_with_input(folderItemView) {
    const inputField = this.create_rename_input(folderItemView.name);
    folderItemView.name_field.replaceWith(inputField);
    folderItemView.edit_name_input = inputField;
  }
}

customElements.define("file-area", FileArea);
