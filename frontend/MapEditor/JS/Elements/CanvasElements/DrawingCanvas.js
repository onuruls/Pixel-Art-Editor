import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Bottom level Canvas
   * Shows the drawing
   * @param {MapEditorCanvas} canvas
   * @param {number} layerIndex
   */
  constructor(canvas, layerIndex) {
    super(canvas);
    this.layerIndex = layerIndex;
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
    this.context = this.querySelector("canvas").getContext("2d");
    this.addEventListener("pen_matrix_changed", (event) =>
      this.draw_pen_canvas(event)
    );
    this.addEventListener("eraser_matrix_changed", (event) =>
      this.erase_canvas(event)
    );
    this.map_editor.addEventListener("zoom_changed", () =>
      this.redraw_canvas()
    );
  }

  /**
   * Handles drawing with the pen tool
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
   * Handles erasing on the canvas
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
   * @param {Event} point
   */
  revert_redo(point) {
    this.erase_single_pixel(point.x, point.y);
    this.paint_single_pixel(point.x, point.y, point.asset);
  }

  /**
   * Redoes the last undo-action from the action stack
   * @param {Event} point
   */
  revert_undo(point) {
    this.erase_single_pixel(point.x, point.y);
    this.paint_single_pixel(point.x, point.y, point.prev_asset);
  }

  /**
   * Redraws the current layer on the canvas
   */
  redraw_canvas() {
    this.clear_canvas();
    this.draw_content();
  }

  /**
   * Clears the canvas context
   */
  clear_canvas() {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the content of the current layer onto the canvas
   */
  draw_content() {
    const content =
      this.map_editor.layer_manager.layers[this.layerIndex].content;
    content.forEach((row, x) => {
      row.forEach((pixel, y) => {
        if (pixel) {
          this.paint_single_pixel(x, y, pixel);
        }
      });
    });
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
