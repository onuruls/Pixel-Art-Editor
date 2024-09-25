import { FileArea } from "../../../Elements/FileArea.js";

export class ContextMenu {
  /**
   * @param {HTMLElement} menu_element
   * @param {FileArea} file_area
   */
  constructor(menu_element, file_area) {
    this.menu_element = menu_element;
    this.file_area = file_area;
  }

  /**
   * Configures the context menu.
   * @returns {void}
   */
  configure() {
    throw new Error("Method must be implemented in subclass.");
  }

  /**
   * Clears all options from the context menu.
   * @returns {void}
   */
  clearOptions() {
    this.menu_element.innerHTML = "";
  }

  /**
   * Adds an option to the context menu.
   * @param {Function} action
   * @param {string} label
   * @returns {void}
   */
  addOption(action, label) {
    const option = document.createElement("div");
    option.textContent = label;
    option.classList.add("context-menu-option");
    option.addEventListener("click", () => {
      action();
      this.hide();
    });
    this.menu_element.appendChild(option);
  }

  /**
   * Shows the context menu at the event's location, adjusting for viewport boundaries.
   * @param {MouseEvent} event
   * @returns {void}
   */
  show(event) {
    this.menu_element.style.visibility = "hidden";
    this.menu_element.style.display = "block";
    this.menu_element.style.left = "0px";
    this.menu_element.style.top = "0px";

    const menuRect = this.menu_element.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    let left = event.clientX;
    let top = event.clientY;

    // Adjust vertical position if the menu would overflow to the bottom
    if (top + menuRect.height > viewportHeight) {
      top = top - menuRect.height;
      if (top < 0) top = 0; // Ensure it doesn't go off-screen to the top
    }

    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    this.menu_element.style.left = `${left + scrollLeft}px`;
    this.menu_element.style.top = `${top + scrollTop}px`;

    this.menu_element.style.visibility = "visible";
    this.menu_element.classList.add("visible");
  }

  /**
   * Hides the context menu.
   * @returns {void}
   */
  hide() {
    this.menu_element.classList.remove("visible");
    this.menu_element.style.display = "none";
  }
}
