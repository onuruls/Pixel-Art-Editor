import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsRight extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
          <div class="right-panel">
            <button class="button">Settings</button>
            <button class="button">Resize</button>
            <button class="button">Import</button>
            <button class="button">Export</button>
        </div>
      `;
  }
  /**
   * Called by upper class
   */
  init() {
    const test_button = document.createElement("button");
    test_button.appendChild(document.createTextNode("SWITCH"));
    test_button.addEventListener("click", (event) => {
      this.file_area.editor_tool.change_editor();
    });
    this.appendChild(test_button);
  }
}

customElements.define("file-area-tools-right", FileAreaToolsRight);
