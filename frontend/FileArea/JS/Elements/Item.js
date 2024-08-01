import { FileAreaView } from "./FileAreaView.js";

export class Item extends HTMLElement {
  /**
   *
   * @param {String} name
   * @param {FileAreaView} file_area_view
   */
  constructor(name, file_area_view) {
    super();
    this.name = name;
    this.file_area_view = file_area_view;
    this.icon = this.create_icon();
    this.name_field = this.create_name_field();
    this.edit_name_input = this.create_edit_name_input();
    this.classList.add("item");
    this.appendChild(this.icon);
    this.appendChild(this.name_field);
    this.init();
  }

  /**
   *
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file");
    return icon;
  }

  /**
   *
   * @returns {HTMLParagraphElement}
   */
  create_name_field() {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(this.name));
    return paragraph;
  }

  /**
   *
   * @returns {HTMLInputElement}
   */
  create_edit_name_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", this.name);
    return input;
  }

  init() {}
}
