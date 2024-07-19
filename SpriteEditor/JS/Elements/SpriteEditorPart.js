import { SpriteEditor } from "./SpriteEditor.js";
export class SpriteEditorPart extends HTMLElement {
  /**
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    super();
    this.sprite_editor = sprite_editor;
    this.innerHTML = this.render();
    this.initialized = false;
  }

  connectedCallback() {
    if (!this.initialized) {
      this.initCSS();
      this.init();
      this.initialized = true;
    }
  }

  initCSS() {
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      `http://127.0.0.1:5500/SpriteEditor/CSS/Elements/${this.constructor.name}.css`
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
  }
}
