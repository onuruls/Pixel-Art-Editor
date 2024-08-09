import { Tool } from "./Tool.js";

export class Eraser extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.map_editor.style.cursor = `crosshair`;
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.map_editor.start_action_buffer();
    this.draw(event);
  }

  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    this.hover(event);
    if (this.is_drawing) {
      this.draw(event);
    }
  }

  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    this.is_drawing = false;
    this.map_editor.end_action_buffer();
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    const { x, y } = this.get_mouse_position(event);
    this.map_editor.eraser_change_matrix(x, y);
  }
}
