import { MapEditorCanvas } from "../MapEditorCanvas.js";

export class TempCanvas extends HTMLElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
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
  }
}

customElements.define("map-temp-canvas", TempCanvas);
