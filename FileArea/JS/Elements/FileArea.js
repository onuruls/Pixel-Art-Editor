import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { FileSystemHandler } from "./Classes/FileSystemHandler.js";
import { FileAreaToolsLeft } from "./FileAreaToolsLeft.js";
import { FileAreaToolsRight } from "./FileAreaToolsRight.js";
import { FileAreaView } from "./FileAreaView.js";

export class FileArea extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_item = null;
    this.css = this.create_css_link();
    this.file_tools_left = new FileAreaToolsLeft(this);
    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaToolsRight(this);
    this.appendChild(this.css);
    this.appendChild(this.file_tools_left);
    this.appendChild(this.file_view);
    this.appendChild(this.file_tools_right);
    this.init();
    //this.sprite_db_request = window.indexedDB.open("sprite_db", 1);
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
  init() {
    this.file_tools_left
      .querySelector("#create_folder_button")
      .addEventListener("click", () => this.create_new_folder());

    this.file_tools_left
      .querySelector("#delete_button")
      .addEventListener("click", () => this.delete_selected_folder());

    this.file_tools_left
      .querySelector("#rename_button")
      .addEventListener("click", () => this.rename_selected_folder());
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.set_listeners();
    this.set_global_click_listener();
  }

  /**
   * From HTMLElement - called when unmounted from DOM
   */
  disconnectedCallback() {
    document.removeEventListener("click", this.global_click_listener);
  }

  /**
   * inits all EventListeners
   */
  set_listeners() {}
  /**
   * Sets a global click listener to deselect the folder
   */
  set_global_click_listener() {
    this.global_click_listener = (event) => {
      const isClickInside =
        this.contains(event.target) && event.target.closest(".folder") !== null;
      if (!isClickInside && this.selected_item) {
        this.selected_item.classList.remove("selected-folder");
        this.selected_item = null;
      }
    };
    document.addEventListener("click", this.global_click_listener);
  }
  /**
   * Creates a new folder element in the file view.
   * The folder includes an image, and an input field for the folder name.
   */
  create_new_folder() {
    const folder_container = this.file_view.querySelector(".center-panel");

    const folder_div = document.createElement("div");
    folder_div.classList.add("folder");
    folder_div.addEventListener("click", () => {
      if (this.selected_item) {
        this.selected_item.classList.remove("selected-folder");
      }
      this.selected_item = folder_div;
      this.selected_item.classList.add("selected-folder");
    });

    const folder_img = document.createElement("img");
    folder_img.src = "img/folder-empty.svg";
    folder_img.alt = "Folder Icon";
    folder_img.classList.add("folder-icon");

    const folder_name_input = document.createElement("input");
    folder_name_input.type = "text";
    folder_name_input.placeholder = "New Folder";
    folder_name_input.classList.add("folder-name-input");
    folder_name_input.maxLength = 12;

    const folder_name_text = document.createElement("span");
    folder_name_text.classList.add("folder-name");
    folder_name_text.textContent = "New Folder";

    folder_name_input.addEventListener("blur", () => {
      folder_name_text.textContent = folder_name_input.value || "New Folder";
      folder_name_input.style.display = "none";
      folder_name_text.style.display = "inline";
    });

    folder_div.appendChild(folder_img);
    folder_div.appendChild(folder_name_input);
    folder_div.appendChild(folder_name_text);
    folder_container.appendChild(folder_div);

    folder_name_text.style.display = "none";
    folder_name_input.focus();
  }

  /**
   * Deletes the selected folder.
   */
  delete_selected_folder() {
    if (this.selected_item) {
      this.selected_item.remove();
      this.selected_item = null;
    }
  }

  rename_selected_folder() {
    if (this.selected_item) {
      const folder_name_text = this.selected_item.querySelector(".folder-name");
      const folder_name_input =
        this.selected_item.querySelector(".folder-name-input");
      if (folder_name_text && folder_name_input) {
        folder_name_input.value = folder_name_text.textContent;
        folder_name_text.style.display = "none";
        folder_name_input.style.display = "inline";
        folder_name_input.focus();
      }
    }
  }
}

customElements.define("file-area", FileArea);
