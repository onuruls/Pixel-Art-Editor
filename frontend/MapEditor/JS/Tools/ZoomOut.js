import { Tool } from "./Tool.js";

export class ZoomOut extends Tool {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.map_editor.style.cursor = `zoom-out`;
  }

  /**
   * @param {Event} event
   */
  mouse_down(event) {
    if (this.map_editor.scale != 1.0) {
      this.zoom(event);
    }
  }

  /**
   * @param {Event} event
   */
  mouse_move(event) {}

  /**
   * @param {Event} event
   */
  mouse_up(event) {}

  /**
   * Zooms out on the canvas based on the mouse position.
   * @param {Event} event
   */
  zoom(event) {
    const { x, y } = this.get_mouse_position(event);
    this.map_editor.apply_zoom(
      -0.5,
      x * 10 * this.map_editor.scale,
      y * 10 * this.map_editor.scale
    );
  }
}
