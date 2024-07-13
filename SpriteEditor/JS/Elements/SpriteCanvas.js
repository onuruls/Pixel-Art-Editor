import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { SpriteEditor } from "./SpriteEditor.js";

export class SpriteCanvas extends SpriteEditorPart {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    super(sprite_editor);
    this.shape_holder = [];
    this.selected_points_holder = [];
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
        <div class="canvas-wrapper">
          <canvas id="drawing_canvas"></canvas>
        </div>
      `;
  }

  /**
   * place for all the event listener
   */
  init() {
    this.drawing_canvas = this.querySelector("#drawing_canvas");
    this.context = this.drawing_canvas.getContext("2d");
    this.drawing_canvas.height = 640;
    this.drawing_canvas.width = 640;
    this.drawing_canvas.addEventListener("resize", (event) => {
      this.drawing_canvas.height = event.target.getBoundingClientRect().height;
      this.drawing_canvas.width = event.target.getBoundingClientRect().width;
    });

    this.drawing_canvas.addEventListener("mousedown", (event) => {
      this.sprite_editor.selected_tool.mouse_down(event);
    });

    this.drawing_canvas.addEventListener("mousemove", (event) => {
      this.sprite_editor.selected_tool.mouse_move(event);
    });

    this.drawing_canvas.addEventListener("mouseup", (event) => {
      this.sprite_editor.selected_tool.mouse_up(event);
    });

    window.addEventListener("mouseup", (event) => {
      this.sprite_editor.selected_tool.global_mouse_up(event);
    });

    this.sprite_editor.addEventListener("pen_matrix_changed", (event) => {
      this.draw_pen_canvas(event);
    });
    this.sprite_editor.addEventListener("erazer_matrix_changed", (event) => {
      this.draw_erazer_canvas(event);
    });
    this.sprite_editor.addEventListener("hover_matrix_changed", (event) => [
      this.draw_hover(event),
    ]);
    this.sprite_editor.addEventListener("fill_matrix_changed", (event) => {
      this.fill_canvas(event);
    });
    this.sprite_editor.addEventListener("revert_action", (event) => {
      this.revert_action(event);
    });
    this.sprite_editor.addEventListener("draw_shape", (event) => {
      this.draw_shape(event);
    });
    this.sprite_editor.addEventListener("move_canvas", (event) => {
      this.move_canvas(event);
    });
    this.sprite_editor.addEventListener("update_selected_area", (event) => {
      this.update_selected_area(event);
    });
    this.sprite_editor.addEventListener("paste_selected_area", (event) => {
      this.paste_selected_area(event);
    });
    this.sprite_editor.addEventListener("remove_selection", (event) => {
      this.remove_selection(event);
    });
  }
  /**
   * Pen tool
   * @param {Event} event
   */
  draw_pen_canvas(event) {
    let color = event.detail.color;
    let x = event.detail.x * 10;
    let y = event.detail.y * 10;
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    this.context.fillStyle = color_str;
    this.context.fillRect(x, y, 10, 10);
  }
  /**
   * Eraser tool
   * @param {Event} event
   */
  draw_erazer_canvas(event) {
    this.erase_single_pixel(event.detail.x, event.detail.y);
  }
  /**
   * Fills an area of the canvas
   * @param {Event} event
   */
  fill_canvas(event) {
    let color = event.detail.color;
    let points = event.detail.points;
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    points.forEach((point) => {
      let x = point.x * 10;
      let y = point.y * 10;
      this.context.fillStyle = color_str;
      if (color_str === "rgba(0,0,0,0)") {
        this.context.clearRect(x, y, 10, 10);
      } else {
        this.context.fillRect(x, y, 10, 10);
      }
    });
  }
  /**
   * Handles the hover effect
   * @param {Event} event
   */
  draw_hover(event) {
    let hover = event.detail.hover;
    let hover_color = "rgba(180,240,213,0.5)";
    let color = event.detail.color;
    let x = event.detail.x * 10;
    let y = event.detail.y * 10;
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    this.context.clearRect(x, y, 10, 10);
    this.context.fillStyle = color_str;
    this.context.fillRect(x, y, 10, 10);
    if (hover) {
      this.context.fillStyle = hover_color;
      this.context.fillRect(x, y, 10, 10);
    }
  }
  /**
   * Reverts the last action from the action_stack in the sprite_editor
   * @param {Event} event
   */
  revert_action(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_color);
    });
  }

  /**
   * Draws shapes on the matrix (rectangle, circle, line)
   * @param {Event} event
   */
  draw_shape(event) {
    const selected_color = event.detail.color;
    const points = event.detail.points;
    if (!event.detail.final) {
      this.revert_canvas();
      this.shape_holder = points;
    } else {
      this.shape_holder = [];
    }
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, selected_color);
    });
  }
  /**
   * Reverts the old points, when shape is not finally drawn
   */
  revert_canvas() {
    this.shape_holder.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_color);
    });
  }
  /**
   * Paints a pixel in the given color
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} color
   */
  paint_single_pixel(x, y, color) {
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    this.context.fillStyle = color_str;
    this.context.fillRect(x * 10, y * 10, 10, 10);
  }

  /**
   * Clears a pixel from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    this.context.clearRect(x * 10, y * 10, 10, 10);
  }
  /**
   * Clears canvas and draws moved pixels
   * @param {Event} event
   */
  move_canvas(event) {
    this.context.clearRect(
      0,
      0,
      this.drawing_canvas.width,
      this.drawing_canvas.height
    );
    const points = event.detail.points;
    points.forEach((point) => {
      const new_x = point.x - event.detail.x_diff;
      const new_y = point.y - event.detail.y_diff;
      if (
        new_x >= 0 &&
        new_x < this.drawing_canvas.width / 10 &&
        new_y >= 0 &&
        new_y < this.drawing_canvas.height / 10
      ) {
        this.paint_single_pixel(new_x, new_y, point.color);
      }
    });
  }
  /**
   * Draws the selected area
   * @param {Event} event
   */
  update_selected_area(event) {
    const points = event.detail.points;
    this.revert_selected_area();
    this.selected_points_holder.push(...points);
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, point.selection_color);
    });
  }

  /**
   * Reverts the selection, when the area is updated or tool is changed
   */
  revert_selected_area() {
    this.selected_points_holder.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_color);
    });
    this.selected_points_holder = [];
  }

  /**
   * Pastes the selected area at new location
   * @param {Event} event
   */
  paste_selected_area(event) {
    this.selected_points_holder = [];
    const points = event.detail.points;
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, point.original_color);
    });
  }

  /**
   * Removes the selected points
   * @param {Event} event
   */
  remove_selection(event) {
    this.revert_selected_area();
  }
}

customElements.define("sprite-canvas", SpriteCanvas);
