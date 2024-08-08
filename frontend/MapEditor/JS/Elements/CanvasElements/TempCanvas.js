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
    this.context = this.canvas.getContext("2d");
  }
}

customElements.define("map-temp-canvas", TempCanvas);
