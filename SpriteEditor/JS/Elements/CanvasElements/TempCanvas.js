import { SpriteCanvas } from "../SpriteCanvas.js";

export class TempCanvas extends HTMLElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super();
    this.sprite_canvas = sprite_canvas;
    this.sprite_editor = sprite_canvas.sprite_editor;
    this.selection_color = [196, 252, 250, 123];
    this.canvas = null;
  }
  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.init();
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
   * Clears the whole canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Paints a pixel in the given color
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} color
   */
  paint_single_pixel(x, y, color) {
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    this.context.fillStyle = color_str;
    this.context.fillRect(x * 10, y * 10, 10, 10);
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

  /**
   * Mixes to Colors into one
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   */
  mix_colors(color1, color2) {
    return [
      Math.round((color1[0] + color2[0]) / 2),
      Math.round((color1[1] + color2[1]) / 2),
      Math.round((color1[2] + color2[2]) / 2),
      128,
    ];
  }
}

customElements.define("temp-canvas", TempCanvas);
