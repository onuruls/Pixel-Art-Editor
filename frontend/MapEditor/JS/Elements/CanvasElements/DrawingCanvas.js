import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Creates an instance of DrawingCanvas
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
  }

  /**
   * Renders the canvas element
   * @returns {String}
   */
  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the DrawingCanvas with its components
   */
  init() {
    this.context = this.querySelector("canvas").getContext("2d"); // Setzt den Kontext
    this.addEventListener("pen_matrix_changed", (event) =>
      this.draw_pen_canvas(event)
    );
    this.addEventListener("eraser_matrix_changed", (event) =>
      this.erase_canvas(event)
    );
    this.addEventListener("revert_undo", (event) => this.revert_undo(event));
    this.addEventListener("revert_redo", (event) => this.revert_redo(event));
    this.map_editor.addEventListener("zoom_changed", () => {
      this.revert_canvas();
      this.redraw_canvas();
    });
  }

  /**
   * Handles drawing on the canvas with the pen tool
   * @param {CustomEvent} event
   */
  draw_pen_canvas(event) {
    const scale = this.map_editor.scale;
    const pixelSize = 10 * scale;
    const asset = event.detail.asset;
    const x = event.detail.x * pixelSize;
    const y = event.detail.y * pixelSize;
    this.context.drawImage(asset, x, y, pixelSize, pixelSize);
  }

  /**
   * Handles erasing on the canvas
   * @param {CustomEvent} event
   */
  erase_canvas(event) {
    const scale = this.map_editor.scale;
    const pixelSize = 10 * scale;
    const x = event.detail.x * pixelSize;
    const y = event.detail.y * pixelSize;
    this.context.clearRect(x, y, pixelSize, pixelSize);
  }

  /**
   * Handles undoing an action on the canvas
   * @param {CustomEvent} event
   */
  revert_undo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_asset);
    });
  }

  /**
   * Handles redoing an action on the canvas
   * @param {CustomEvent} event
   */
  revert_redo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.asset);
    });
  }

  /**
   * Redraws the entire canvas based on the current state
   */
  redraw_canvas() {
    const scale = this.map_editor.scale;
    const pixelSize = 10 * scale;
    this.map_editor.canvas_matrix.forEach((row, x) =>
      row.forEach((pixel, y) => {
        this.erase_single_pixel(x, y);
        this.paint_single_pixel(x, y, pixel);
      })
    );
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
