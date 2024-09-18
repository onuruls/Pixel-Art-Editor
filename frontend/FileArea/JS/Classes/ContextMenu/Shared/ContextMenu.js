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
   * Shows the context menu at the event's location.
   * @param {MouseEvent} event
   * @returns {void}
   */
  show(event) {
    this.menu_element.style.left = `${event.pageX}px`;
    this.menu_element.style.top = `${event.pageY}px`;
    this.menu_element.classList.add("visible");
  }

  /**
   * Hides the context menu.
   * @returns {void}
   */
  hide() {
    this.menu_element.classList.remove("visible");
  }
}
