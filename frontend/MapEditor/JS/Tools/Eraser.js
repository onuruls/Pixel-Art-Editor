import { Tool } from "./Tool.js";

export class Eraser extends Tool {
  /**
   * Creates an instance of the Eraser tool.
   * @param {MapEditor} map_editor - The instance of the MapEditor.
   */
  constructor(map_editor) {
    super(map_editor);
    this.map_editor.style.cursor = `crosshair`;
  }

  /**
   * Handles the mouse down event to start erasing.
   * @param {Event} event - The mouse down event.
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.map_editor.start_action_buffer();
    this.draw(event);
  }

  /**
   * Handles the mouse move event to erase as the mouse moves.
   * @param {Event} event - The mouse move event.
   */
  mouse_move(event) {
    this.hover(event);
    if (this.is_drawing) {
      this.draw(event);
    }
  }

  /**
   * Handles the mouse up event to stop erasing.
   * @param {Event} event - The mouse up event.
   */
  mouse_up(event) {
    this.is_drawing = false;
    this.map_editor.end_action_buffer();
  }

  /**
   * Erases on the canvas based on the mouse position.
   * @param {Event} event - The event containing mouse position.
   */
  draw(event) {
    const { x, y } = this.get_mouse_position(event);
    this.map_editor.eraser_change_matrix(x, y);
  }
}
