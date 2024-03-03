import { Tool } from "./Tool.js";

export class Pen extends Tool {
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
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    let rect = this.canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let color = [54, 80, 32, 255];
    const x = Math.floor(mouseX / 10);
    const y = Math.floor(mouseY / 10);
    this.sprite_editor.change_canvas_matrix(x, y, color);
  }
}
