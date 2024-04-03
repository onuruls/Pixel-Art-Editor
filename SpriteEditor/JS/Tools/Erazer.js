import { Tool } from "./Tool.js";

export class Erazer extends Tool {
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
    this.is_drawing = true;
    this.draw(event);
    this.sprite_editor.start_action_buffer();
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
    this.sprite_editor.end_action_buffer();
  }

  draw(event) {
    const position = this.get_mouse_position(event);
    this.sprite_editor.erazer_change_matrix(position.x, position.y);
  }
}
