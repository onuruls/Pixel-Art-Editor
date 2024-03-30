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
    this.draw(event);
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
    var mouse_x = event.clientX - rect.left;
    var mouse_y = event.clientY - rect.top;
    const x = Math.floor(mouse_x / 10);
    const y = Math.floor(mouse_y / 10);
    this.sprite_editor.fill_same_color_matrix(x, y);
  }
}
