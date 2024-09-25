import { MapEditor } from "./MapEditor.js";

export class MapEditorPart extends HTMLElement {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super();
    this.map_editor = map_editor;
    this.innerHTML = this.render();
    this.initialized = false;
  }

  connectedCallback() {
    if (!this.initialized) {
      this.initCSS();
      this.init();
      this.initialized = true;
    }
    this.set_listeners();
  }

  initCSS() {
    const css = document.createElement("link");
    css.setAttribute(
      "href",
      `../MapEditor/CSS/Elements/${this.constructor.name}.css`
    );
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    this.appendChild(css);
  }

  set_listeners() {}
}
