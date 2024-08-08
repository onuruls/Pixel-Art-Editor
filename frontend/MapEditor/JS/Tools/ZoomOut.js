import { Tool } from "./Tool.js";

export class ZoomOut extends Tool {
  /**
   *
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.map_editor.style.cursor = `zoom-out`;
  }

  /**
   * Handles mouse down event for zooming out
   * @param {Event} event
   */
  mouse_down(event) {
    if (this.map_editor.scale != 1.0) {
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
    const { x: mouseX, y: mouseY } = this.get_mouse_position(event);
    this.map_editor.apply_zoom(
      -0.5,
      mouseX * 10 * this.map_editor.scale,
      mouseY * 10 * this.map_editor.scale
    );
  }
}
