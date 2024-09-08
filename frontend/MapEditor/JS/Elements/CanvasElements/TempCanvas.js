import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class TempCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
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
    this.context = this.canvas.getContext("2d");
    this.map_editor.addEventListener("draw_temp_shape", (e) => {
      this.draw_temp_shape(e);
    });
  }

  /**
   * Draws a temporary shape while mousebutton is down
   * @param {Event} event
   */
  draw_temp_shape(event) {
    this.revert_canvas();
    this.draw_shape(event);
  }
}

customElements.define("map-temp-canvas", TempCanvas);
