import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsLeft extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <div class="left-panel">
            <button class="button">Sprite Editor</button>
            <button id="new_folder" class="file_area_button"><img src="img/new-folder.svg" alt="New Folder"><New Folder</button>
            <button class="button">Delete</button>
            <button class="button">Rename</button>
        </div>
      `;
  }

  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
