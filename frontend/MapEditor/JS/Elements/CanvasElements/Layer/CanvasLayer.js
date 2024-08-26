import { MapEditorCanvas } from "../../MapEditorCanvas.js";

export class CanvasLayer extends HTMLElement {
  /**
   * Abstract base class for different types of canvas layers
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super();
    if (new.target === CanvasLayer) {
      throw new TypeError("Cannot construct CanvasLayer instances directly");
    }
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

  update_canvas_size() {
    const scale = this.map_editor.scale;
    this.canvas.width = 640 * scale;
    this.canvas.height = 640 * scale;
  }

  /**
   * Renders the HTML structure for the canvas layer
   * @returns {String}
   */
  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the layer (to be implemented by subclasses)
   */
  init() {
    throw new Error("init method must be implemented by subclass");
  }

  /**
   * Paints a single pixel on the canvas (to be customized by subclasses)
   * @param {Number} x
   * @param {Number} y
   * @param {String} asset
   */
  paint_single_pixel(x, y, asset) {
    throw new Error(
      "paint_single_pixel method must be implemented by subclass"
    );
  }

  /**
   * Erases a single pixel on the canvas (to be customized by subclasses)
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    throw new Error(
      "erase_single_pixel method must be implemented by subclass"
    );
  }

  /**
   * Clears the entire canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
