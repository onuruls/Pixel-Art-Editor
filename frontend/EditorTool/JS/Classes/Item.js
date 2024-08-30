export class Item {
  /**
   * Parent class for Files and Folders
   * @param {Number} id
   * @param {String} name
   * @param {Number} folder_id
   */
  constructor(id, name, folder_id) {
    this.id = id;
    this.name = name;
    this.folder_id = folder_id;
  }
}
