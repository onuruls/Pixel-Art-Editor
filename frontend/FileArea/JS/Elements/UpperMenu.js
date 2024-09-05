import { FileArea } from "./FileArea.js";

export class UpperMenu extends HTMLElement {
  /**
   * Upper Menu in the FileArea
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.classList.add("upper-menu");
    this.file_area = file_area;
    this.editor_name = "Map Editor";
    this.editor_button = this.create_editor_button();
    this.appendChild(this.editor_button);
    this.init();
  }

  /**
   * Called when the component is added to the DOM
   */
  connectedCallback() {
    this.file_system_handler = this.file_area.file_system_handler;
    this.update_project_name();
  }

  /**
   * Creates the editor button
   * @returns {HTMLButtonElement}
   */
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
   * Creates the project name element
   * @returns {HTMLSpanElement}
   */
  create_project_name_element() {
    const project_name_element = document.createElement("span");
    const project_name =
      this.file_area?.file_system_handler?.project?.name || "Untitled Project";
    project_name_element.classList.add("project-name");
    project_name_element.textContent = `Project: ${project_name}`;
    return project_name_element;
  }
  /**
   * Updates the project name
   */
  update_project_name() {
    const project_name_element = this.querySelector(".project-name");
    const project_name =
      this.file_area?.file_system_handler?.project?.name || "Untitled Project";
    project_name_element.textContent = `Project: ${project_name}`;
  }

  init() {
    this.editor_button.addEventListener(
      "click",
      this.file_area.editor_tool.change_editor.bind(this.file_area.editor_tool)
    );
    const project_name_element = this.create_project_name_element();
    this.appendChild(project_name_element);
  }

  set_editor_name(name) {
    this.querySelector("#switch_to i").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }
}

customElements.define("upper-menu", UpperMenu);
