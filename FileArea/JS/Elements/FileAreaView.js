import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaView extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <div class="center-panel">
        </div>
      `;
  }
  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-view", FileAreaView);
