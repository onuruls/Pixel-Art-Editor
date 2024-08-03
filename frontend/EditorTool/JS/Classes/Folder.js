import { File } from "./File.js";
import { Item } from "./Item.js";

export class Folder extends Item {
  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {Array<Object>} children
   */
  constructor(name, type, children) {
    super(name, type);
    this.children = this.create_children(children);
  }

  /**
   * initializes the children Objects
   * @param {Array<Object>} children
   * @returns {Array<Item>}
   */
  create_children(children) {
    return children.map((child) => {
      if (child.type === "folder") {
        return new Folder(child.name, child.type, child.children);
      } else if (child.type === "file") {
        return new File(child.name, child.type, child.editor);
      }
    });
  }

  /**
   * Creates a new Folder
   */
  create_folder() {
    const baseName = "new folder";
    let folderName = baseName;
    let count = 1;

    while (this.children.some((child) => child.name === folderName)) {
      folderName = `${baseName} (${count})`;
      count++;
    }

    this.children.push(new Folder(folderName, "folder", []));
    console.log(`Folder created: ${folderName}`);
  }

  /**
   *
   * @param {String} name
   */
  delete_item(name) {}
}
