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
    this.draw_hover_bind = this.draw_hover.bind(this);
    this.remove_hover_bind = this.remove_hover.bind(this);
    this.zoom_changed_bind = this.zoom_changed.bind(this);
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
    this.map_editor.addEventListener(
      "hover_matrix_changed",
      this.draw_hover_bind
    );
    this.map_editor.addEventListener("remove_hover", this.remove_hover_bind);
    this.map_editor.addEventListener("zoom_changed", this.zoom_changed_bind);
  }

  /**
   * Disables all the EventListeners of the canvas
   * Called when disconnected from DOM
   */
  disable_listeners() {
    this.map_editor.removeEventListener(
      "hover_matrix_changed",
      this.draw_hover_bind
    );
    this.map_editor.removeEventListener("remove_hover", this.remove_hover_bind);
    this.map_editor.removeEventListener("zoom_changed", this.zoom_changed_bind);
  }

  /**
   * Called when the zoom changed
   * @param {Event} event
   */
  zoom_changed(event) {
    this.remove_hover();
    this.draw_hover(event);
  }

  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    this.revert_canvas();
    const scale = this.map_editor.scale;
    const tile_size = this.map_editor.tile_size;
    const size = event.detail.size * scale;
    const x = event.detail.x * tile_size * scale;
    const y = event.detail.y * tile_size * scale;
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
