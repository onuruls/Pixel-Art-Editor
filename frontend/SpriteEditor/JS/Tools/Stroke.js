import { Tool } from "./Tool.js";

export class Stroke extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/stroke.png";
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
    this.end_x = position.x;
    this.end_y = position.y;
    if (this.is_drawing) {
      this.draw(event);
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
    let end_x = this.end_x;
    let end_y = this.end_y;

    if (event.shiftKey) {
      const dx = this.end_x - this.start_x;
      const dy = this.end_y - this.start_y;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

      end_x = this.start_x + Math.cos(snapAngle) * distance;
      end_y = this.start_y + Math.sin(snapAngle) * distance;
    }

    end_x = Math.round(end_x);
    end_y = Math.round(end_y);

    if (this.start_x <= end_x) {
      this.sprite_editor.draw_line_matrix(
        this.start_x,
        this.start_y,
        end_x,
        end_y,
        final
      );
    } else {
      this.sprite_editor.draw_line_matrix(
        end_x,
        end_y,
        this.start_x,
        this.start_y,
        final
      );
    }
  }
}
