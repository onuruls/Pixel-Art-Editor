import { File } from "./File.js";
import { Item } from "./Item.js";

export class Folder extends Item {
  /**
   *
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   * @param {Array<Item>} children
   */
  constructor(id, name, folder_id = null, children = []) {
    super(id, name, folder_id);
    this.children = children;
  }

  /**
   * Builds the children of a folder from Array of Objects
   * @param {Array<Object>} children
   */
  build_folder_structure(children) {
    this.children = children.map((child) => {
      if (child.children) {
        const folder = new Folder(child.id, child.name, child.folder_id, null);
        folder.build_folder_structure(child.children);
        return folder;
      } else {
        const item = new Item(child.id, child.name, child.folder_id);
        return item;
      }
    });
  }

  /**
   *
   * @param {String} name
   */
  delete_item(name) {
    console.log("Not implemented yet");
  }
}
