import { Tool } from "./Tool.js";

export class SameColorBucket extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    return;
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    return;
  }
  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    return;
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    var rect = this.canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / 10);
    const y = Math.floor(mouseY / 10);
    this.sprite_editor.fill_same_color_matrix(x, y);
  }
}
