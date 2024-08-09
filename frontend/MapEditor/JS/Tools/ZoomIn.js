import { Tool } from "./Tool.js";

export class ZoomIn extends Tool {
  /**
   *
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.map_editor.style.cursor = `zoom-in`;
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
  mouse_move(event) {}

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
    const { x, y } = this.get_mouse_position(event);
    this.map_editor.apply_zoom(
      0.5,
      x * 10 * this.map_editor.scale,
      y * 10 * this.map_editor.scale
    );
  }
}
