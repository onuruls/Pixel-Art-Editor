import { Tool } from "./Tool.js";

export class RectangleSelection extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.canvas.style.cursor = `crosshair`;
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.sprite_editor.set_selection_start_point(
      this.get_mouse_position(event)
    );
    this.draw(event);
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
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
  }

  /**
   *
   * @param {Event} event
   */
  draw(event, final = false) {
    const position = this.get_mouse_position(event);
    this.sprite_editor.draw_rectangle_selection(position);
  }
}
