import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class HoverCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows the hover effect of the tools
   * Could be implemented into the TempCanvas
   * @param {MapEditorCanvas} map_canvas
   */
  constructor(map_canvas) {
    super(map_canvas);
    this.context = null;
    this.hover_color = "rgba(180,240,213,0.5)";
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
    this.map_editor.addEventListener("hover_matrix_changed", (event) => {
      this.draw_hover(event);
    });
    this.map_editor.addEventListener("remove_hover", (event) => {
      this.remove_hover(event);
    });
  }

  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    this.revert_canvas();
    const size = event.detail.size;
    const x = event.detail.x * 10;
    const y = event.detail.y * 10;
    this.context.fillStyle = this.hover_color;
    this.context.fillRect(x, y, size, size);
  }

  /**
   * Removes the hover effect
   * @param {Event} event
   */
  remove_hover(event) {
    this.revert_canvas();
  }
}

customElements.define("map-hover-canvas", HoverCanvas);
