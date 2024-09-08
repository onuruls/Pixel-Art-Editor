import { ContextMenu } from "./ContextMenu.js";
import { AddFolderAction } from "./AddFolderAction.js";
import { AddFileAction } from "./AddFileAction.js";

/**
 * Context menu for the file area
 */
export class FileAreaContextMenu extends ContextMenu {
  /**
   * @param {FileArea} file_area
   * @param {HTMLElement} menu_element
   */
  constructor(file_area, menu_element) {
    super(menu_element);
    this.file_area = file_area;

    this.actions = {
      add_folder: new AddFolderAction(this.file_area),
      add_file: new AddFileAction(this.file_area),
    };
  }

  /**
   * Configures the context menu
   * @returns {void}
   */
  configure() {
    this.clearOptions();
    this.addOption(() => this.actions.add_folder.execute(), "Add Folder");
    this.addOption(() => this.actions.add_file.execute(), "Add File");
  }
}
