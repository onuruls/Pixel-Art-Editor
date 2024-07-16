import { SpriteEditor } from "../Elements/SpriteEditor.js";
import { SelectionTool } from "./SelectionTool.js";

export class RectangleSelection extends SelectionTool {
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
   *
   * @param {Event} event
   */
  mouse_down(event) {
    if (!this.mouse_over_selected_area(event)) {
      this.is_drawing = true;
      this.sprite_editor.set_selection_start_point(
        this.get_mouse_position(event)
      );
      this.draw(event);
    } else {
      this.sprite_editor.set_selection_move_start_point(
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
    if (this.is_drawing) {
      this.draw(event);
    } else if (this.is_moving) {
      this.move(event);
    }
  }

  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    this.is_drawing = false;
    this.is_moving = false;
  }

  /**
   *
   * @param {Event} event
   */
  draw(event, final = false) {
    const position = this.get_mouse_position(event);
    this.sprite_editor.draw_rectangle_selection(position);
  }

  /**
   * Moves the selected area
   * @param {Event} event
   */
  move(event) {
    const position = this.get_mouse_position(event);
    if (!this.compare_points(position, this.last_move_position)) {
      this.sprite_editor.move_selected_area(position);
      this.last_move_position = position;
    }
  }
}
