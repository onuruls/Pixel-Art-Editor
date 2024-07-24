import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class TempCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.context = null;
    this.selection_color = [196, 252, 250, 123];
  }

  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the Canvas
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.canvas.height = 640;
    this.canvas.width = 640;
    this.sprite_editor.addEventListener("draw_temp_shape", (event) => {
      this.draw_shape(event);
    });
    this.sprite_editor.addEventListener("draw_shape", (event) => {
      this.revert_canvas();
    });
    this.sprite_editor.addEventListener("update_selected_area", (event) => {
      this.update_selected_area(event);
    });
    this.sprite_editor.addEventListener("selected_area_copied", (event) => {
      this.selected_area_copied(event);
    });
    this.sprite_editor.addEventListener("remove_selection", (event) => {
      this.remove_selection(event);
    });
  }

  /**
   * Draws shapes on the matrix (rectangle, circle, line)
   * @param {Event} event
   */
  draw_shape(event) {
    const selected_color = event.detail.color;
    const points = event.detail.points;
    this.revert_canvas();
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, selected_color);
    });
  }

  /**
   * Draws the selected area
   * @param {Event} event
   */
  update_selected_area(event) {
    this.revert_canvas();
    const points = event.detail.points;
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, point.selection_color);
    });
  }

  /**
   * Called when the selected area is copied
   * Copies the selected pixels to the selected_area to
   * show what has been copied
   * @param {*} event
   */
  selected_area_copied(event) {
    this.revert_canvas();
    const points = event.detail.points;
    points.forEach((point) => {
      this.paint_single_pixel(
        point.x,
        point.y,
        this.mix_colors(this.selection_color, point.original_color)
      );
    });
  }

  /**
   * Removes the selected area
   * @param {Event} event
   */
  remove_selection(event) {
    this.revert_canvas();
  }
}

customElements.define("temp-canvas", TempCanvas);
