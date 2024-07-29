import { MapEditorCanvas } from "../MapEditorCanvas.js";

export class DrawingCanvas extends HTMLElement {
  /**
   * Bottom level Canvas
   * Shows the drawing (canvas_matrix)
   * @param {MapEditorCanvas} map_canvas
   */
  constructor(map_canvas) {
    super();
    this.map_canvas = map_canvas;
    this.map_editor = map_canvas.map_editor;
    this.canvas = null;
  }

  /**
   * From HTMLElement called when element is mounted
   */
  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.init();
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
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
    this.map_editor.addEventListener("pen_matrix_changed", (event) => {
      this.draw_pen_canvas(event);
    });
    this.map_editor.addEventListener("revert_undo", (event) => {
      this.revert_undo(event);
    });
  }

  /**
   * Pen tool
   * @param {Event} event
   */
  draw_pen_canvas(event) {
    const asset = event.detail.asset;
    const x = event.detail.x;
    const y = event.detail.y;
    this.context.drawImage(asset, x * 10, y * 10, 10, 10);
  }

  /**
   * Paints a pixel with the selected asset
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} asset
   */
  paint_single_pixel(x, y, asset) {
    const img = new Image();
    img.src = asset;
    img.onload = () => {
      this.context.drawImage(img, x * 10, y * 10, 10, 10);
    };
  }

  /**
   * Clears a pixel from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    this.context.clearRect(x * 10, y * 10, 10, 10);
  }

  /**
   * Reverts the last action from the action_stack in the map_editor
   * @param {Event} event
   */
  revert_undo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_asset);
    });
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
