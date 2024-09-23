import { MapEditor } from "../Elements/MapEditor.js";
import { Tool } from "./Tool.js";

export class SelectionTool extends Tool {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.canvas = map_editor.map_canvas.input_canvas.canvas;
    this.canvas.style.cursor = `crosshair`;
    this.is_moving = false;
    this.last_move_position = { x: -1, y: -1 };
  }

  /**
   * Handles all the keydown-Events of a tool e.g. CTRL + C
   */
  handle_key_down_events(e) {
    if (e.ctrlKey && e.key === "c") {
      this.map_editor.copy_selected_pixel();
    }

    if (e.ctrlKey && e.key === "v" && this.map_editor.selection_copied) {
      this.map_editor.paste_selected_pixel();
    }

    if (e.ctrlKey && e.key === "x") {
      this.map_editor.cut_selected_pixel();
    }
  }

  /**
   * Returns TRUE if mouse is over selected area
   * @param {Event} event
   * @returns {Boolean}
   */
  mouse_over_selected_area(event) {
    const mouse_position = this.get_mouse_position(event);
    const result = this.map_editor.selected_points.find(
      (point) => point.x === mouse_position.x && point.y === mouse_position.y
    );
    return result !== undefined;
  }

  /**
   * Checks if two points are equal
   * @param {{x: Number, y: Number}} p1
   * @param {{x: Number, y: Number}} p2
   * @returns {Boolean}
   */
  compare_points(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  /**
   * Called when Object is "destroyed"
   */
  destroy() {
    super.destroy();
    this.map_editor.destroy_selection();
  }
}
