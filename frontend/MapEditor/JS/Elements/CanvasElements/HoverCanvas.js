import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class HoverCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows the hover effect of the tools
   * Could be implemented into the TempCanvas
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
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
    this.map_editor.addEventListener("hover_matrix_changed", (event) =>
      this.draw_hover(event)
    );
    this.map_editor.addEventListener("remove_hover", () => this.remove_hover());
    this.map_editor.addEventListener("zoom_changed", (event) => {
      this.remove_hover();
      this.draw_hover(event);
    });
  }

  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    this.revert_canvas();
    const scale = this.map_editor.scale;
    const size = event.detail.size * scale;
    const x = event.detail.x * 10 * scale;
    const y = event.detail.y * 10 * scale;
    this.context.fillStyle = this.hover_color;
    this.context.fillRect(x, y, size, size);
  }

  /**
   * Removes the hover effect
   */
  remove_hover() {
    this.revert_canvas();
  }
}

customElements.define("map-hover-canvas", HoverCanvas);
