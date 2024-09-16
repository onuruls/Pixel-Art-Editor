import { ContextMenu } from "../Shared/ContextMenu.js";
import { AddFolderAction } from "../Actions/AddFolderAction.js";
import { AddFileAction } from "../Actions/AddFileAction.js";

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

    // Create separate actions for each file type
    this.actions = {
      add_folder: new AddFolderAction(this.file_area),
      add_png_file: new AddFileAction(this.file_area, "png"),
      add_tmx_file: new AddFileAction(this.file_area, "tmx"),
    };
  }

  /**
   * Configures the context menu
   * @returns {void}
   */
  configure() {
    this.clearOptions();
    this.addOption(() => this.actions.add_folder.execute(), "Add Folder");
    this.addOption(() => this.actions.add_png_file.execute(), "Add PNG File");
    this.addOption(() => this.actions.add_tmx_file.execute(), "Add TMX File");
  }
}
