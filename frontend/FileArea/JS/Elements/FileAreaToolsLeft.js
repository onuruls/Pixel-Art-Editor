import { FileArea } from "./FileArea.js";

export class FileAreaToolsLeft extends HTMLElement {
  /**
   * Left Toolbar in the FileArea
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.classList.add("file-area-tools");
    this.file_area = file_area;
    this.editor_name = "Map Editor";
    this.editor_button = this.create_editor_button();
    this.appendChild(this.editor_button);
    this.init();
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

  init() {
    this.editor_button.addEventListener(
      "click",
      this.file_area.editor_tool.change_editor.bind(this.file_area.editor_tool)
    );
  }

  set_editor_name(name) {
    this.querySelector("#switch_to i").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
