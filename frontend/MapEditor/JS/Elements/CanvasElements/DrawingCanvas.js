import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Bottom level Canvas
   * Shows the drawing (canvas_matrix)
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
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
   * Pen tool
   * @param {Event} event
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
   * Eraser tool
   * @param {Event} event
   */
  erase_canvas(event) {
    const scale = this.map_editor.scale;
    const pixelSize = 10 * scale;
    const x = event.detail.x * pixelSize;
    const y = event.detail.y * pixelSize;
    this.context.clearRect(x, y, pixelSize, pixelSize);
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

  /**
   * Redoing the last undo-action from the action stack
   * @param {Event} event
   */
  revert_redo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.asset);
    });
  }

  /**
   * Redraws all layers
   */
  redraw_canvas() {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.map_editor.layers.forEach((layer) => {
      layer.forEach((row, x) => {
        row.forEach((pixel, y) => {
          if (pixel) {
            this.paint_single_pixel(x, y, pixel);
          }
        });
      });
    });
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
