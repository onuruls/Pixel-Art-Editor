import { FileAreaPart } from "./FileAreaPart.js";

export class FileAreaToolsRight extends FileAreaPart {
  constructor(file_area) {
    super(file_area);
  }

  render() {
    return `
        <p>RightTools</p>
      `;
  }
  /**
   * Called by upper class
   */
  init() {}
}

customElements.define("file-area-tools-right", FileAreaToolsRight);
