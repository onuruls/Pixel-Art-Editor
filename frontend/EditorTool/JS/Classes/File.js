import { Item } from "./Item.js";

export class File extends Item {
  /**
   *
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   * @param {String} type
   */
  constructor(id, name, folder_id, type) {
    super(id, name, folder_id);
    this.type = type;
  }
}
