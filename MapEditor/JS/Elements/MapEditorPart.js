export class MapEditorPart extends HTMLElement {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super();
    this.map_editor = map_editor;
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

  initCSS() {
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      `http://127.0.0.1:5500/MapEditor/CSS/Elements/${this.constructor.name}.css`
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
  }
}
