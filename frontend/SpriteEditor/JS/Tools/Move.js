import { Tool } from "./Tool.js";

export class Move extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/move.png";
    this.last_position = { x: 0, y: 0 };
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.sprite_editor.start_action_buffer();
    this.sprite_editor.filter_move_points();
    this.last_position = this.get_mouse_position(event);
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
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
    this.draw(event, true);
    this.sprite_editor.end_action_buffer();
  }

  /**
   *
   * @param {Event} event
   */
  draw(event, final = false) {
    const position = this.get_mouse_position(event);
    if (final) {
      this.sprite_editor.finish_move(
        this.last_position.x - position.x,
        this.last_position.y - position.y
      );
    } else {
      this.sprite_editor.move_matrix(
        this.last_position.x - position.x,
        this.last_position.y - position.y
      );
    }
  }
}
