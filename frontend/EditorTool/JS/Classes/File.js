import { Item } from "./Item.js";

export class File extends Item {
  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {String} editor
   */
  constructor(name, type, editor) {
    super(name, type);
    this.editor = editor;
  }
}
