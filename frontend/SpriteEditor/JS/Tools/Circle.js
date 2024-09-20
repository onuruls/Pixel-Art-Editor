import { EditorUtil } from "../../../Util/EditorUtil.js";
import { Tool } from "./Tool.js";

export class Circle extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/circle.png";
    this.start_x = 0;
    this.start_y = 0;
    this.end_x = 0;
    this.end_y = 0;
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    const position = this.get_mouse_position(event);
    this.start_x = position.x;
    this.start_y = position.y;
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    this.activate_cursor_icon();
    const position = this.get_mouse_position(event);
    if (this.has_mouse_position_changed(position.x, position.y)) {
      this.end_x = position.x;
      this.end_y = position.y;
      if (this.is_drawing) {
        this.draw(event);
      }
    }
  }
  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    this.is_drawing = false;
    this.draw(event, true);
  }

  /**
   *
   * @param {Event} event
   */
  draw(event, final = false) {
    const { end_x, end_y } = EditorUtil.calculate_aspect_ratio(
      this.start_x,
      this.start_y,
      this.end_x,
      this.end_y,
      event.shiftKey
    );

    this.sprite_editor.draw_circle_matrix(
      end_x,
      end_y,
      this.start_x,
      this.start_y,
      final
    );
  }
}
