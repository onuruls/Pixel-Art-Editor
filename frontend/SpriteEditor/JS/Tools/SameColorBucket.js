import { Tool } from "./Tool.js";

export class SameColorBucket extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/bucket.png";
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
    this.activate_cursor_icon();
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
    const mousekey = event.buttons;
    this.sprite_editor.fill_same_color_matrix(position.x, position.y, mousekey);
  }
}
