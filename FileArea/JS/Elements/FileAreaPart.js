import { FileArea } from "./FileArea.js";

export class FileAreaPart extends HTMLElement {
  /**
   *
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.innerHTML = this.render();
    this.initCSS();
    this.init();
  }

  /**
   * From HTMLElement - called when unmounted from DOM
   */
  disconnectedCallback() {}

  /**
   * Adds the CSS-File to the custom element
   */
  initCSS() {
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      `http://127.0.0.1:5500/FileArea/CSS/Elements/${this.constructor.name}.css`
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
  }
}
