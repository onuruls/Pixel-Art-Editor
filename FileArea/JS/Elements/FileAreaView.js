import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaView extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <p>View</p>
      `;
  }
  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-view", FileAreaView);
