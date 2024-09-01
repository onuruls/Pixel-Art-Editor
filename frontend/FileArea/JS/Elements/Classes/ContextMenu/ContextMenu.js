export class ContextMenu {
  /**
   * @param {HTMLElement} menuElement
   */
  constructor(menuElement) {
    /** @type {HTMLElement} */
    this.menuElement = menuElement;
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
    this.menuElement.innerHTML = "";
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
    this.menuElement.appendChild(option);
  }

  /**
   * Shows the context menu at the event's location.
   * @param {MouseEvent} event
   * @returns {void}
   */
  show(event) {
    this.menuElement.style.left = `${event.pageX}px`;
    this.menuElement.style.top = `${event.pageY}px`;
    this.menuElement.classList.add("visible");
  }

  /**
   * Hides the context menu.
   * @returns {void}
   */
  hide() {
    this.menuElement.classList.remove("visible");
  }
}
