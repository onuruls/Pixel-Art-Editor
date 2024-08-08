import { MapEditorCanvas } from "../MapEditorCanvas.js";

export class CanvasElement extends HTMLElement {
  /**
   * Parent-Class for the different canvas elements
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.map_editor = canvas.map_editor;
    this.canvas = null;
  }

  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.height = 640;
    this.canvas.width = 640;
    this.init();
  }

  /**
   * Paints a pixel with the selected asset
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} asset
   */
  paint_single_pixel(x, y, asset) {
    const scale = this.map_editor.scale;
    const img = new Image();
    img.src = asset;
    img.onload = () => {
      this.context.drawImage(
        img,
        x * 10 * scale,
        y * 10 * scale,
        10 * scale,
        10 * scale
      );
    };
  }

  /**
   * Clears a pixel from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    const scale = this.map_editor.scale;
    this.context.clearRect(
      x * 10 * scale,
      y * 10 * scale,
      10 * scale,
      10 * scale
    );
  }

  /**
   * Clears the whole canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
