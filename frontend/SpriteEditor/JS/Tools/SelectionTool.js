import { SpriteEditor } from "../Elements/SpriteEditor.js";
import { Tool } from "./Tool.js";

export class SelectionTool extends Tool {
  /**
   *
   * @param {SpriteEditor} sprite_edtor
   */
  constructor(sprite_edtor) {
    super(sprite_edtor);
    this.canvas.style.cursor = `crosshair`;
    this.is_moving = false;
    this.last_move_position = { x: -1, y: -1 };
  }

  /**
   * Handles all the keydown-Events of a tool e.g. CTRL + C
   */
  handle_key_down_events(e) {
    if (e.ctrlKey && e.key === "c") {
      this.sprite_editor.copy_selected_pixel();
    }

    if (e.ctrlKey && e.key === "v" && this.sprite_editor.selection_copied) {
      this.sprite_editor.paste_selected_pixel();
    }

    if (e.ctrlKey && e.key === "x") {
      this.sprite_editor.cut_selected_pixel();
    }
  }

  /**
   * Returns TRUE if mouse is over selected area
   * @param {Event} event
   * @returns {Boolean}
   */
  mouse_over_selected_area(event) {
    const mouse_position = this.get_mouse_position(event);
    const result = this.sprite_editor.selected_points.find(
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

  destroy() {
    super.destroy();
    this.sprite_editor.destroy_selection();
  }
}
