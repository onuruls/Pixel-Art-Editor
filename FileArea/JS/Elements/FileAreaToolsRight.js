import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsRight extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
          <div class="right-panel">
            <button id="settings"><img src="img/settings.svg" alt="New Folder">Settings</button>
            <button id="resize"><img src="img/save.svg" alt="Save">Save</button>
            <button id="import"><img src="img/import.svg" alt="Import">Import</button>
            <button id="export"><img src="img/export.svg" alt="Export">Export</button>
        </div>
      `;
  }
  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-tools-right", FileAreaToolsRight);
