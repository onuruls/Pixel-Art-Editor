import { Tool } from "./Tool.js";

export class Lighting extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/lighten.png";
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
    this.sprite_editor.changed_points = [];
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    const position = this.get_mouse_position(event);
    const darken = this.is_shift_pressed;
    this.sprite_editor.change_brightness_matrix(
      position.x,
      position.y,
      5,
      darken
    );
  }
}
