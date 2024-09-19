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
    this.editor_name = "Map Editor";
    this.project_name = "Untitled Project";
    this.project_container = null;
    this.project_name_element = null;
    this.file_container = null;
    this.file_name_element = null;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.editor_button = this.create_editor_button();
    this.appendChild(this.editor_button);
    this.editor_button.addEventListener(
      "click",
      this.editor_tool.change_editor.bind(this.editor_tool)
    );
    const file_container = this.create_file_container();
    this.appendChild(file_container);
    const project_container = this.create_project_container();
    this.appendChild(project_container);
  }

  /**
   * @returns {HTMLButtonElement}
   * */
  create_editor_button() {
    const editor_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-circle-chevron-left", "fa-fw");
    icon.setAttribute("alt", this.editor_name);
    editor_button.setAttribute("id", "switch_to");
    editor_button.appendChild(icon);
    editor_button.appendChild(document.createTextNode(this.editor_name));
    return editor_button;
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

    const project_label = document.createElement("span");
    project_label.textContent = "Project: ";

    this.project_name = this.editor_tool.project?.name || this.project_name;
    this.project_name_element = document.createElement("span");
    this.project_name_element.textContent = this.project_name;

    this.project_container.appendChild(project_label);
    this.project_container.appendChild(this.project_name_element);

    this.project_name_element.addEventListener("click", () =>
      this.show_input_field()
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
   * Shows the input field for renaming the project
   */
  show_input_field() {
    const input_container = document.createElement("div");
    input_container.classList.add("input-container");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("rename-input");
    input.value = this.project_name;

    const submit_icon = document.createElement("i");
    submit_icon.classList.add("fa-solid", "fa-check", "submit-icon");

    const cancel_icon = document.createElement("i");
    cancel_icon.classList.add("fa-solid", "fa-xmark", "cancel-icon");

    input_container.appendChild(input);
    input_container.appendChild(submit_icon);
    input_container.appendChild(cancel_icon);

    const project_label =
      this.project_container.querySelector("span:last-child");
    project_label.replaceWith(input_container);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.rename_project(input_container);
      } else if (e.key === "Escape") {
        input_container.replaceWith(project_label);
      }
    });

    submit_icon.addEventListener("click", () => {
      this.rename_project(input_container);
    });

    cancel_icon.addEventListener("click", () => {
      input_container.replaceWith(project_label);
    });

    input.focus();
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

  /**
   * Sets the editor name after switch
   * @param {string} name
   */
  set_editor_name(name) {
    this.querySelector("#switch_to i").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }
}

customElements.define("top-menu", TopMenu);
