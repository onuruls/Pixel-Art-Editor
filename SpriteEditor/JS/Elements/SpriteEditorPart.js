export class SpriteEditorPart extends HTMLElement {
  constructor(sprite_editor) {
    super();
    this.sprite_editor = sprite_editor;
  }

  /**
   *
   * @param {SpriteEditor} spriteEditor
   */

  connectedCallback() {
    this.innerHTML = this.render();
    this.initCSS();
    this.init();
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
