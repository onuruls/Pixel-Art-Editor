import { Item } from "./Item.js";

export class File extends Item {
  /**
   * Represents a File in the FileArea
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   * @param {String} type
   * @param {String} url
   * @param {Array<Array<String>>} matrix_data
   */
  constructor(id, name, folder_id, type, url, matrix_data) {
    super(id, name, folder_id);
    this.type = type;
    this.url = url;
    this.matrix_data = matrix_data;
  }
}
