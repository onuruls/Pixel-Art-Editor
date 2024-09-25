import { Util } from "../../../../Util/Util.js";
import { MapEditorCanvas } from "../MapEditorCanvas.js";

export class CanvasElement extends HTMLElement {
  /**
   * Parent-Class for the different canvas elements
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super();
    this.parent_canvas = canvas;
    this.map_editor = canvas?.map_editor;
  }

  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.context = this.canvas.getContext("2d");
    this.init();
    this.update_canvas_size();
  }

  disconnectedCallback() {
    this.disable_listeners();
  }

  /**
   * Removes all the listeners when canvas is removed from DOM
   */
  disable_listeners() {}

  update_canvas_size() {
    const scale = this.map_editor.scale;
    this.canvas.width = this.map_editor.canvas_wrapper_width * scale;
    this.canvas.height = this.map_editor.canvas_wrapper_height * scale;
  }

  /**
   * Paints a pixel with the selected asset
   * @param {Number} x
   * @param {Number} y
   * @param {String} asset
   */
  paint_single_pixel(x, y, asset) {
    const size = this.map_editor.scale * this.map_editor.tile_size;

    if (this.map_editor.image_cache[asset]) {
      const img = this.map_editor.image_cache[asset];
      this.context.drawImage(img, x * size, y * size, size, size);
    } else {
      const img = new Image();
      img.src = asset;
      img.onload = () => {
        this.map_editor.image_cache[asset] = img;
        this.context.drawImage(img, x * size, y * size, size, size);
      };
    }
  }

  /**
   * Clears a pixel from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    const size = this.map_editor.scale * this.map_editor.tile_size;
    this.context.clearRect(x * size, y * size, size, size);
  }

  /**
   * Clears the whole canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws a shape to the canvas (Stroke, Rectangle, Circle)
   * @param {Event} event
   */
  draw_shape(event) {
    const selected_assset = event.detail.asset;
    const points = event.detail.points;
    const size = this.map_editor.scale * this.map_editor.tile_size;
    points.forEach((point) => {
      this.context.drawImage(
        selected_assset,
        point.x * size,
        point.y * size,
        size,
        size
      );
    });
  }

  /**
   *
   * @param {Array<Number>} color_array
   */
  color_array_to_string(color_array) {
    return `rgba(${color_array[0]},${color_array[1]},${color_array[2]},${
      color_array[3] / 255
    })`;
  }
}
