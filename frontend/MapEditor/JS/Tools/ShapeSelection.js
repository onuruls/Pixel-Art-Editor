import { SelectionTool } from "./SelectionTool.js";
import { MapEditor } from "../Elements/MapEditor.js";

export class ShapeSelection extends SelectionTool {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.canvas.style.cursor = `crosshair`;
    this.is_moving = false;
    this.last_move_position = { x: -1, y: -1 };
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    if (!this.mouse_over_selected_area(event)) {
      const position = this.get_mouse_position(event);
      this.map_editor.shape_selection(position.x, position.y);
    } else {
      this.map_editor.set_selection_move_start_point(
        this.get_mouse_position(event)
      );
      this.is_moving = true;
    }
  }

  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    if (this.is_moving) {
      this.move(event);
    }
  }

  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    this.is_moving = false;
  }

  /**
   * Moves the selected area
   * @param {Event} event
   */
  move(event) {
    const position = this.get_mouse_position(event);
    if (!this.compare_points(position, this.last_move_position)) {
      this.map_editor.move_selected_area(position);
      this.last_move_position = position;
    }
  }
}
