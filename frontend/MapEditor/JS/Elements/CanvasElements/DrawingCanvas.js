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
    this.canvas = canvas;
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
    const asset = event.detail.asset;
    const x =
      event.detail.x * 10 * this.map_editor.scale -
      this.map_editor.map_canvas.querySelector(".canvas-wrapper").scrollLeft;
    const y =
      event.detail.y * 10 * this.map_editor.scale -
      this.map_editor.map_canvas.querySelector(".canvas-wrapper").scrollTop;
    this.context.drawImage(asset, x, y, 10 * scale, 10 * scale);
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
   * Redraws the whole canvas
   */
  redraw_canvas() {
    this.map_editor.canvas_matrix.forEach((row, x) =>
      row.forEach((pixel, y) => {
        this.erase_single_pixel(x, y);
        this.paint_single_pixel(x, y, pixel);
      })
    );
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
