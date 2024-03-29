import { Tool } from "./Tool.js";

export class Stroke extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.start_x = 0;
    this.start_y = 0;
    this.end_x = 0;
    this.end_y = 0;
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    const position = this.get_mouse_position(event);
    this.start_x = position.x;
    this.start_y = position.y;
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    const position = this.get_mouse_position(event);
    this.end_x = position.x;
    this.end_y = position.y;
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
    this.draw(event, true);
  }

  /**
   *
   * @param {Event} event
   */
  draw(event, final = false) {
    if (this.start_x <= this.end_x) {
      this.sprite_editor.draw_line_matrix(
        this.start_x,
        this.start_y,
        this.end_x,
        this.end_y,
        final
      );
    } else {
      this.sprite_editor.draw_line_matrix(
        this.end_x,
        this.end_y,
        this.start_x,
        this.start_y,
        final
      );
    }
  }
}
