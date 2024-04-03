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
    const position = this.get_mouse_position(event);
    this.sprite_editor.fill_same_color_matrix(position.x, position.y);
  }
}
