import { Tool } from "./Tool.js";

export class ColorPicker extends Tool {
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
    this.sprite_editor.pick_color(position.x, position.y);
  }
}
