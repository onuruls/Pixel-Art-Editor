import { Item } from "./Item.js";

export class File extends Item {
  /**
   * Represents a File in the FileArea
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   * @param {String} type
   * @param {String} url
   * @param {JSON} data
   */
  constructor(id, name, folder_id, type, url, data) {
    super(id, name, folder_id);
    this.type = type;
    this.url = url;
    this.data = data;
  }

  /**
   * Updates the data in the file
   * @param {JSON} data
   */
  update_data(data) {
    this.data = data;
  }
}
