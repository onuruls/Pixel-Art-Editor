import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Bottom level Canvas
   * Shows the drawing (canvas_matrix)
   * @param {MapEditorCanvas} map_canvas
   */
  constructor(map_canvas) {
    super(map_canvas);
    this.map_canvas = map_canvas;
    this.context = null;
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
    this.map_editor.addEventListener("pen_matrix_changed", (event) => {
      this.draw_pen_canvas(event);
    });
    this.map_editor.addEventListener("revert_undo", (event) => {
      this.revert_undo(event);
    });
    this.map_editor.addEventListener("revert_redo", (event) => {
      this.revert_redo(event);
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
}

customElements.define("map-drawing-canvas", DrawingCanvas);
