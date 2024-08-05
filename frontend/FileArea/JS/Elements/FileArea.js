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
    this.file_system_handler = null;
    this.appendChild(this.css);
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
    this.file_system_handler.create_folder();
  }

  /**
   * Deletes the selected folder.
   */
  delete_selected_folder() {
    this.file_system_handler.active_folder.delete_item(this.selected_item);
  }

  rename_selected_folder() {}
}

customElements.define("file-area", FileArea);
