/**
 * @class ItemView
 * Parent-View-Class for the views in the FileAreaView.
 * Represents a general item with an icon and a name field.
 * @extends {HTMLElement}
 */
export class ItemView extends HTMLElement {
  /**
   * @constructor
   * @param {string} name - The name of the item.
   * @param {FileAreaView} file_area_view - The parent FileAreaView instance.
   * @param {number} id - The unique ID of the item.
   */
  constructor(name, file_area_view, id) {
    super();
    this.name = name;
    this.file_area_view = file_area_view;
    this.id = id;

    // Create icon and name field
    this.icon = this.create_icon();
    this.name_field = this.create_name_field();
    this.edit_name_input = null;

    this.classList.add("item");
    this.setAttribute("data-id", this.id);

    this.appendChild(this.icon);
    this.appendChild(this.name_field);
    this.init();
  }

  /**
   * Creates an icon for the item. This method should be overwritten
   * by child classes to customize the icon type (e.g., folder or file).
   * @returns {HTMLElement} The created icon element (default: file icon).
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file"); // Default icon: file
    return icon;
  }

  /**
   * Creates a name field for the item.
   * @returns {HTMLParagraphElement} The created name field element.
   */
  create_name_field() {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(this.name));
    return paragraph;
  }

  /**
   * Creates an input field for editing the name.
   * @returns {HTMLInputElement} The created input field for editing.
   */
  create_edit_name_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", this.name);
    input.classList.add("folder-name-input");
    return input;
  }

  /**
   * Initialization logic for the item view.
   * Can be overridden by child classes.
   */
  init() {}
}

customElements.define("item-view", ItemView);
