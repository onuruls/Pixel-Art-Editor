import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsLeft extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <p>LeftTools</p>
      `;
  }

  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
