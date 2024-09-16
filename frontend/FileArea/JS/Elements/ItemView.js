export class ItemView extends HTMLElement {
  /**
   * @constructor
   * @param {string} name
   * @param {FileAreaView} file_area_view
   * @param {number} id
   */
  constructor(name, file_area_view, id) {
    super();
    this.name = name;
    this.file_area_view = file_area_view;
    this.id = id;

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
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file");
    return icon;
  }

  /**
   * Creates a name field for the item.
   * @returns {HTMLParagraphElement}
   */
  create_name_field() {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(this.name));
    return paragraph;
  }

  /**
   * Creates an input field for editing the name.
   * @returns {HTMLInputElement}
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
