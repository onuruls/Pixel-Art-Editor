import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsLeft extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <div class="left-panel">
            <a href="" id="go_to_sprite_editor"><img src="img/chevron-left-circle.svg" alt="Go to SpriteEditor">Sprite Editor</a>
            <button id="new_folder"><img src="img/new-folder.svg" alt="New Folder">New Folder</button>
            <button id="delete_button"><img src="img/delete.svg" alt="Delete">Delete</button>
            <button id="rename_button"><img src="img/rename.svg" alt="Rename">Rename</button>
        </div>
      `;
  }

  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
