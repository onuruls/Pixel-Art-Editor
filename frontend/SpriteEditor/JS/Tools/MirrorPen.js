import { Tool } from "./Tool.js";

export class MirrorPen extends Tool {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.cursor_icon_url = "./img/cursors/mirror-pen.png";
    this.current_mirror = "vertical";
  }

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    this.is_drawing = true;
    this.sprite_editor.start_action_buffer();
    this.draw(event);
  }
  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    this.hover(event);
    this.activate_cursor_icon();
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
    this.sprite_editor.end_action_buffer();
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const tile_size = this.sprite_editor.tile_size;
    const x = Math.floor(mouseX / tile_size);
    const y = Math.floor(mouseY / tile_size);
    const half_of_pixel = (this.sprite_editor.pixel_size * tile_size) / 2;
    const mousekey = event.buttons;

    const desired_mirror = this.is_shift_pressed ? "horizontal" : "vertical";
    const switch_state = this.current_mirror !== desired_mirror;
    this.current_mirror = desired_mirror;

    if (this.is_shift_pressed) {
      const middleY = rect.height / 2 - half_of_pixel;
      const { y1, y2 } = this.calculateHorizontalMirrorCoords(mouseY, middleY);
      this.sprite_editor.mirror_pen_change_matrix(
        x,
        x,
        y1,
        y2,
        switch_state,
        mousekey
      );
    } else {
      const middleX = rect.width / 2 - half_of_pixel;
      const { x1, x2 } = this.calculateVerticalMirrorCoords(mouseX, middleX);
      this.sprite_editor.mirror_pen_change_matrix(
        x1,
        x2,
        y,
        y,
        switch_state,
        mousekey
      );
    }
  }

  /**
   * Calculates the mirrored coordinates for the x-axis
   * @param {Number} x
   * @param {Number} middleX
   * @returns {{x1: Number, x2: Number}}
   */
  calculateVerticalMirrorCoords(x, middleX) {
    const tile_size = this.sprite_editor.tile_size;
    const x1 = Math.floor(x / tile_size) * tile_size;
    const x_mid_diff = x1 - middleX;
    const x2 = x1 - 2 * x_mid_diff;
    return { x1: Math.floor(x1 / tile_size), x2: Math.floor(x2 / tile_size) };
  }

  /**
   * Calculates the mirrored coordinates for the y-axis
   * @param {Number} y
   * @param {Number} middleY
   * @returns {{y1: Number, y2: Number}}
   */
  calculateHorizontalMirrorCoords(y, middleY) {
    const tile_size = this.sprite_editor.tile_size;
    const y1 = Math.floor(y / tile_size) * tile_size;
    const y_mid_diff = y1 - middleY;
    const y2 = y1 - 2 * y_mid_diff;
    return { y1: Math.floor(y1 / tile_size), y2: Math.floor(y2 / tile_size) };
  }
}
