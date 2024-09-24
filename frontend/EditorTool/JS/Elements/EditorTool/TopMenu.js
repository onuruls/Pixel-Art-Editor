import { BackendClient } from "../../../../BackendClient/BackendClient.js";
import { EditorTool } from "../EditorTool.js";

/**
 * Header bar for the editor tool
 */
export class TopMenu extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.classList.add("top-menu");
    this.editor_tool = editor_tool;
    this.project_name = "Untitled Project";
    this.project_container = null;
    this.project_name_element = null;
    this.file_container = null;
    this.file_name_element = null;
    this.input_container = this.create_input_container();
    this.show_input_field_bind = this.show_input_field.bind(this);
    this.keydown_bind = this.keydown.bind(this);
    this.rename_bind = this.rename_project.bind(this, this.input_container);
    this.remove_input_bind = this.remove_input.bind(this);
    this.init();
  }

  init() {
    const file_container = this.create_file_container();
    this.appendChild(file_container);
    const project_container = this.create_project_container();
    this.appendChild(project_container);
  }

  connectedCallback() {
    this.input.addEventListener("keydown", this.keydown_bind);
    this.submit_icon.addEventListener("click", this.rename_bind);
    this.cancel_icon.addEventListener("click", this.remove_input_bind);
  }

  disconnectedCallback() {
    this.input.removeEventListener("keydown", this.keydown_bind);
    this.submit_icon.removeEventListener("click", this.rename_bind);
    this.cancel_icon.removeEventListener("click", this.remove_input_bind);
  }

  /**
   * Handles the keydown events
   * @param {Event} event
   */
  keydown(e) {
    if (e.key === "Enter") {
      this.rename_project(this.input_container);
    } else if (e.key === "Escape") {
      this.input_container.replaceWith(this.project_label);
    }
  }

  /**
   * Removes the input
   */
  remove_input() {
    this.input_container.replaceWith(this.project_label);
  }

  /**
   * @returns {HTMLDivElement}
   * */
  create_file_container() {
    this.file_container = document.createElement("div");
    this.file_container.classList.add("file-container");

    const file_label = document.createElement("span");
    file_label.textContent = "File: ";
    this.file_name_element = document.createElement("span");
    this.file_name_element.textContent =
      this.editor_tool.active_file?.name || "Untitled File";

    this.file_container.appendChild(file_label);
    this.file_container.appendChild(this.file_name_element);

    return this.file_container;
  }

  /**
   * @returns {HTMLDivElement}
   * */
  create_project_container() {
    this.project_container = document.createElement("div");
    this.project_container.classList.add("project-container");

    this.project_label = document.createElement("span");
    this.project_label.textContent = "Project: ";

    this.project_name = this.editor_tool.project?.name || this.project_name;
    this.project_name_element = document.createElement("span");
    this.project_name_element.textContent = this.project_name;

    this.project_container.appendChild(this.project_label);
    this.project_container.appendChild(this.project_name_element);

    this.project_name_element.addEventListener(
      "click",
      this.show_input_field_bind
    );

    return this.project_container;
  }

  /**
   * Updates the file name displayed in the file container
   * @param {string} file_name
   */
  update_file_name(file_name) {
    this.file_name_element.textContent = file_name || "Untitled File";
  }

  /**
   * Creates the input container for the project rename
   * @returns {HTMLDivElement}
   */
  create_input_container() {
    const input_container = document.createElement("div");
    input_container.classList.add("input-container");

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.classList.add("rename-input");
    this.input.value = this.project_name;

    this.submit_icon = document.createElement("i");
    this.submit_icon.classList.add("fa-solid", "fa-check", "submit-icon");

    this.cancel_icon = document.createElement("i");
    this.cancel_icon.classList.add("fa-solid", "fa-xmark", "cancel-icon");

    input_container.appendChild(this.input);
    input_container.appendChild(this.submit_icon);
    input_container.appendChild(this.cancel_icon);
    return input_container;
  }

  /**
   * Shows the input field for renaming the project
   */
  show_input_field() {
    this.project_label =
      this.project_container.querySelector("span:last-child");
    this.project_label.replaceWith(this.input_container);
    this.input.focus();
  }

  /**
   * Renames the project
   * @param {HTMLDivElement} input_container
   * */
  async rename_project(input_container) {
    const input = input_container.querySelector("input");
    const new_name = input.value.trim();

    if (new_name && new_name !== this.project_name) {
      try {
        await BackendClient.rename_project(
          this.editor_tool.project.id,
          new_name
        );
        this.editor_tool.project.name = new_name;
        this.project_name = new_name;
      } catch (error) {
        console.error("Error renaming project:", error);
      }
    }

    this.project_name_element.textContent = this.project_name;
    input_container.replaceWith(this.project_name_element);
  }
}

customElements.define("top-menu", TopMenu);
