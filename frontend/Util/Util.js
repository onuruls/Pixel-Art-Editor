export class Util {
  constructor() {}

  /**
   * @param {String} element_type
   * @param {String} id
   * @param {Array<String>} classes
   * @param {String} text_content
   * @returns {HTMLElement}
   */
  static create_element(
    element_type,
    id = "",
    classes = [],
    text_content = ""
  ) {
    const element = document.createElement(element_type);
    element.id = id;
    element.textContent = text_content;
    for (const _class of classes) {
      element.classList.add(_class);
    }
    return element;
  }

  /**
   * @param {String} id
   * @param {Array<String>} classes
   * @param {String} text_content
   * @param {Function} onClick
   * @returns {HTMLButtonElement}
   */
  static create_button(
    id = "",
    classes = [],
    text_content = "",
    onClick = null
  ) {
    const button = document.createElement("button");
    button.id = id;
    button.textContent = text_content;
    for (const _class of classes) {
      button.classList.add(_class);
    }
    if (onClick) {
      button.addEventListener("click", onClick);
    }
    return button;
  }
}
