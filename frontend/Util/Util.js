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
    if (id != "") {
      element.id = id;
    }
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
   * @param {Array<String>} iconClass
   * @returns {HTMLButtonElement}
   */
  static create_button(
    id = "",
    classes = [],
    text_content = "",
    onClick = null,
    iconClass = null
  ) {
    const button = document.createElement("button");
    if (id != "") {
      button.id = id;
    }
    button.textContent = text_content;
    for (const _class of classes) {
      button.classList.add(_class);
    }
    if (onClick) {
      button.addEventListener("click", onClick);
    }
    if (iconClass) {
      const icon = document.createElement("i");
      icon.classList.add(...iconClass);
      button.prepend(icon);
    }
    return button;
  }

  /**
   * Creates and displays tool info
   * @param {HTMLElement} parent
   * @param {Array<String>} info
   */
  static create_tool_info(parent, info) {
    parent.addEventListener("mouseover", (e) => {
      const tool_info = Util.create_element("div", "", ["tool-info"], "");

      info.forEach((line) => {
        const match = line.match(/\(([^)]+)\)/);
        const paren_word = match ? match[1] : "";
        const rest_of_line = match ? line.replace(match[0], "") : line;

        const line_element = Util.create_element("p", "lines", [], "");

        if (paren_word) {
          const paren_word_element = Util.create_element(
            "span",
            "paren_word",
            [],
            paren_word
          );
          line_element.appendChild(paren_word_element);
        }

        const rest_element = document.createTextNode(rest_of_line);
        line_element.appendChild(rest_element);

        tool_info.appendChild(line_element);
      });

      document.querySelector("#editor_container").appendChild(tool_info);

      tool_info.style.left = `${e.pageX + 10}px`;
      tool_info.style.top = `${e.pageY + 10}px`;

      parent.addEventListener("mousemove", (e) => {
        tool_info.style.left = `${e.pageX + 10}px`;
        tool_info.style.top = `${e.pageY + 10}px`;
      });

      parent.addEventListener("mouseout", () => {
        tool_info.remove();
      });
    });
  }
}
