import { Tool } from "./Tool.js";

export class Dithering extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/dither.png";
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.sprite_editor.start_action_buffer();
    this.draw(event);
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    this.hover(event);
    this.activate_cursor_icon();
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
    this.sprite_editor.end_action_buffer();
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    const position = this.get_mouse_position(event);
    if (this.draw_or_erase(position) == "draw") {
      this.sprite_editor.pen_change_matrix(position.x, position.y);
    } else {
      this.sprite_editor.erazer_change_matrix(position.x, position.y);
    }
  }

  draw_or_erase(position) {
    const is_x_odd = position.x % 2 !== 0;
    const is_y_odd = position.y % 2 !== 0;
    if ((is_x_odd && !is_y_odd) || (!is_x_odd && is_y_odd)) {
      return "draw";
    } else {
      return "erase";
    }
  }
}
