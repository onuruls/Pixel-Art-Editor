import { Tool } from "./Tool.js";

export class Pen extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursorIconUrl = "./img/cursors/pen.png";
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
    let rect = this.canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / 10);
    const y = Math.floor(mouseY / 10);
    this.sprite_editor.pen_change_matrix(x, y);
  }
}
