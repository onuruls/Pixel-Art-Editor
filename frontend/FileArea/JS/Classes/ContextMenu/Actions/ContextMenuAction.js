import { FileArea } from "../../../Elements/FileArea.js";

export class ContextMenuAction {
  /**
   *
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    this.file_area = file_area;
  }
  /**
   * Executes the action.
   * @returns {void}
   */
  execute() {
    throw new Error("Method 'execute' must be implemented.");
  }
}
