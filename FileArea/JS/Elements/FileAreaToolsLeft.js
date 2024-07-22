import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsLeft extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
    this.editor_name = "Map Editor";
  }

  set_editor_name(name) {
    this.querySelector("#switch_to img").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }

  render() {
    return `
      <div class="left-panel">
          <button id="switch_to"><img src="img/chevron-left-circle.svg" alt="${this.editor_name}">${this.editor_name}</button>
          <button id="new_folder"><img src="img/new-folder.svg" alt="New Folder">New Folder</button>
          <button id="delete_button"><img src="img/delete.svg" alt="Delete">Delete</button>
          <button id="rename_button"><img src="img/rename.svg" alt="Rename">Rename</button>
      </div>
    `;
  }

  connectedCallback() {
    this.innerHTML = this.render();
    this.init();
  }

  init() {
    this.querySelector("#switch_to").addEventListener("click", (event) => {
      this.file_area.editor_tool.change_editor();
    });
  }
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
