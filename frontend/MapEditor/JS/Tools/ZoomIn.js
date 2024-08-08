import { Tool } from "./Tool.js";

export class ZoomIn extends Tool {
  /**
   *
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
  }

  /**
   * Handles mouse down event for zooming in
   * @param {Event} event
   */
  mouse_down(event) {
    if (this.map_editor.scale != 2.0) {
      this.zoom(event);
    }
  }

  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    this.hover(event);
  }

  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {}

  /**
   *
   * @param {Event} event
   */
  zoom(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    this.map_editor.apply_zoom(0.5, mouseX, mouseY);
  }
}
