import { Item } from "./Item.js";

export class File extends Item {
  /**
   * Represents a File in the FileArea
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   * @param {String} type
   * @param {String} url
   * @param {Array<Array<Array<String>>>} matrix_data
   * @param {Array<Array<Array<String>>>} data
   */
  constructor(id, name, folder_id, type, url, matrix_data, data) {
    super(id, name, folder_id);
    this.type = type;
    this.url = url;
    this.matrix_data = matrix_data;
    this.data = data;
  }

  /**
   * Updates the matrix_data in the file
   * @param {Array<Array<Array<String>>>} matrix_data
   */
  update_matrix_data(matrix_data) {
    this.matrix_data = matrix_data;
  }
}
