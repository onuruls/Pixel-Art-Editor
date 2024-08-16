import { Tool } from "./Tool.js";

export class Pen extends Tool {
  /**
   * Creates an instance of the Pen tool.
   * @param {MapEditor} map_editor - The instance of the MapEditor.
   */
  constructor(map_editor) {
    super(map_editor);
    this.map_editor.style.cursor = `crosshair`;
  }

  /**
   * Handles the mouse down event to start drawing.
   * @param {Event} event - The mouse down event.
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.map_editor.start_action_buffer();
    this.draw(event);
  }

  /**
   * Handles the mouse move event to draw as the mouse moves.
   * @param {Event} event - The mouse move event.
   */
  mouse_move(event) {
    this.hover(event);
    if (this.is_drawing) {
      this.draw(event);
    }
  }

  /**
   * Handles the mouse up event to stop drawing.
   * @param {Event} event - The mouse up event.
   */
  mouse_up(event) {
    this.is_drawing = false;
    this.map_editor.end_action_buffer();
  }

  /**
   * Draws on the canvas based on the mouse position.
   * @param {Event} event - The event containing mouse position.
   */
  draw(event) {
    const { x, y } = this.get_mouse_position(event);
    this.map_editor.pen_change_matrix(x, y);
  }
}
