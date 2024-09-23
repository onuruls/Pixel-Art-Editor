import { Item } from "./Item.js";
import { File } from "./File.js";

export class Folder extends Item {
  /**
   * Represents a folder in the FileArea
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
   * Builds the children of a folder from an array of objects.
   * @param {Array<Object>} children
   */
  build_folder_structure(children) {
    this.children = children.map((child) => {
      if (child.children) {
        const folder = new Folder(child.id, child.name, child.parent_folder_id);
        folder.build_folder_structure(child.children);
        return folder;
      } else {
        const item = new File(
          child.id,
          child.name,
          child.folder_id,
          child.type,
          child.url,
          child.matrix_data,
          child.data
        );
        return item;
      }
    });
  }
}
