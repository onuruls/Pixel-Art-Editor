import { SpriteCanvas } from "../SpriteCanvas.js";

export class HoverCanvas extends HTMLElement {
  /**
   * Intermediate level Canvas
   * Shows the hover effect of the tools
   * Could be implemented into the TempCanvas
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super();
    this.sprite_canvas = sprite_canvas;
    this.sprite_editor = sprite_canvas.sprite_editor;
    this.hover_color = "rgba(180,240,213,0.5)";
    this.canvas = null;
    this.last_hover = null;
  }
  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.init();
  }
  render() {
    return `<canvas></canvas>`;
  }
  /**
   * Initializes the Canvas
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.canvas.height = 640;
    this.canvas.width = 640;
    this.sprite_editor.addEventListener("hover_matrix_changed", (event) => {
      this.draw_hover(event);
    });
    this.sprite_editor.addEventListener("remove_hover", (event) => {
      this.remove_hover(event);
    });
  }

  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    const size = event.detail.size;
    if (this.last_hover) {
      this.context.clearRect(this.last_hover.x, this.last_hover.y, size, size);
    }
    const x = event.detail.x * 10;
    const y = event.detail.y * 10;
    this.context.fillStyle = this.hover_color;
    this.context.fillRect(x, y, size, size);
    this.last_hover = { x, y };
  }

  /**
   * Removes the hover effect
   * @param {Event} event
   */
  remove_hover(event) {
    this.revert_canvas();
  }

  /**
   * Clears the whole canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

customElements.define("hover-canvas", HoverCanvas);
