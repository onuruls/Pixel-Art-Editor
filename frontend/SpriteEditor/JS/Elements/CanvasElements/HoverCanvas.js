import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";
import { ColorUtil } from "../../../../Util/ColorUtil.js";

export class HoverCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows the hover effect of the tools
   * Could be implemented into the TempCanvas
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.context = null;
    this.hover_color = ColorUtil.hover_color;
    this.draw_hover_bind = this.draw_hover.bind(this);
    this.remove_hover_bind = this.remove_hover.bind(this);
  }

  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the Canvas
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.sprite_editor.addEventListener(
      "hover_matrix_changed",
      this.draw_hover_bind
    );
    this.sprite_editor.addEventListener("remove_hover", this.remove_hover_bind);
  }

  disconnectedCallback() {
    this.sprite_editor.removeEventListener(
      "hover_matrix_changed",
      this.draw_hover_bind
    );
    this.sprite_editor.removeEventListener(
      "remove_hover",
      this.remove_hover_bind
    );
  }

  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    this.revert_canvas();
    const size = event.detail.size;
    const tile_size = this.sprite_editor.tile_size;
    const x = event.detail.x * tile_size;
    const y = event.detail.y * tile_size;
    this.context.fillStyle = this.hover_color;
    this.context.fillRect(x, y, size, size);
  }

  /**
   * Removes the hover effect
   * @param {Event} event
   */
  remove_hover(event) {
    this.revert_canvas();
  }

  /**
   * Clears the hover canvas.
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

customElements.define("hover-canvas", HoverCanvas);
