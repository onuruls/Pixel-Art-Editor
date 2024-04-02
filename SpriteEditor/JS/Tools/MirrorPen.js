import { Tool } from "./Tool.js";

export class MirrorPen extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursorIconUrl = "./img/cursors/mirror-pen.png";
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
    this.activateCursorIcon();
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
    var rect = this.canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;
    let middleX = rect.width / 2 - 5;
    let x1 = Math.floor(mouseX / 10) * 10;
    let y = Math.floor(mouseY / 10) * 10;
    let x_mid_diff = x1 - middleX;
    let x2 = x1 - 2 * x_mid_diff;
    x1 = Math.floor(x1 / 10);
    y = Math.floor(y / 10);
    x2 = Math.floor(x2 / 10);
    this.sprite_editor.pen_change_matrix(x1, y);
    this.sprite_editor.pen_change_matrix(x2, y);
  }
}
