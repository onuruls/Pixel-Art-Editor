import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Bottom level Canvas
   * Shows the drawing (canvas_matrix)
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.context = null;
    console.log(this.sprite_editor);
  }

  render() {
    return `<canvas></canvas>`;
  }
  /**
   * Initializes the Canvas
   */
  init() {
    this.sprite_editor.addEventListener("pen_matrix_changed", (event) => {
      this.draw_pen_canvas(event);
    });
    this.sprite_editor.addEventListener("eraser_matrix_changed", (event) => {
      this.draw_eraser_canvas(event);
    });
    this.sprite_editor.addEventListener("fill_matrix_changed", (event) => {
      this.fill_canvas(event);
    });
    this.sprite_editor.addEventListener("revert_undo", (event) => {
      this.revert_undo(event);
    });
    this.sprite_editor.addEventListener("revert_redo", (event) => {
      this.revert_redo(event);
    });
    this.sprite_editor.addEventListener("draw_shape", (event) => {
      this.draw_shape(event);
    });
    this.sprite_editor.addEventListener("move_canvas", (event) => {
      this.move_canvas(event);
    });
    this.sprite_editor.addEventListener("cut_selected_area", (event) => {
      this.cut_selected_area(event);
    });
    this.sprite_editor.addEventListener("paste_selected_area", (event) => {
      this.paste_selected_area(event);
    });
    this.sprite_editor.addEventListener("repaint_canvas", (event) => {
      this.repaint_canvas(event);
    });
    this.sprite_editor.addEventListener("erase_selected_pixels", (event) => {
      this.erase_selected_pixels(event);
    });
  }

  /**
   * Pen tool
   * @param {Event} event
   */
  draw_pen_canvas(event) {
    const color = event.detail.color;
    const x = event.detail.x;
    const y = event.detail.y;
    this.paint_single_pixel(x, y, color);
  }

  /**
   * Eraser tool
   * @param {Event} event
   */
  draw_eraser_canvas(event) {
    this.erase_single_pixel(event.detail.x, event.detail.y);
  }

  /**
   * Fills an area of the canvas
   * @param {Event} event
   */
  fill_canvas(event) {
    const color = event.detail.color;
    const points = event.detail.points;
    const color_str = `rgba(${color[0]},${color[1]},${color[2]},${
      color[3] / 255
    })`;
    const tile_size = this.sprite_editor.tile_size;
    points.forEach((point) => {
      const x = point.x * tile_size;
      const y = point.y * tile_size;
      this.context.fillStyle = color_str;
      if (color_str === "rgba(0,0,0,0)") {
        this.context.clearRect(x, y, tile_size, tile_size);
      } else {
        this.context.fillRect(x, y, tile_size, tile_size);
      }
    });
  }

  /**
   * Reverts the last action from the action_stack in the sprite_editor
   * @param {Event} event
   */
  revert_undo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.prev_color);
    });
  }

  /**
   * Redoing the last undo-action from the action stack
   * @param {Event} event
   */
  revert_redo(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      this.paint_single_pixel(point.x, point.y, point.color);
    });
  }

  /**
   * Draws shapes on the matrix (rectangle, circle, line)
   * @param {Event} event
   */
  draw_shape(event) {
    const selected_color = event.detail.color;
    const points = event.detail.points;
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, selected_color);
    });
  }

  /**
   * Clears canvas and draws moved pixels
   * @param {Event} event
   */
  move_canvas(event) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const points = event.detail.points;
    const tile_size = this.sprite_editor.tile_size;
    points.forEach((point) => {
      const new_x = point.x - event.detail.x_diff;
      const new_y = point.y - event.detail.y_diff;
      if (
        new_x >= 0 &&
        new_x < this.canvas.width / tile_size &&
        new_y >= 0 &&
        new_y < this.canvas.height / tile_size
      ) {
        this.paint_single_pixel(new_x, new_y, point.color);
      }
    });
  }

  /**
   * Cuts the area from the canvas
   * @param {Event} event
   */
  cut_selected_area(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
    });
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

  erase_selected_pixels(event) {
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
    });
  }

  /**
   * Repaints the whole canvas, after sprite is imported or canvas is resized
   * @param {Event} event
   */
  repaint_canvas(event) {
    this.sprite_editor.canvas_matrix.forEach((row, x) =>
      row.forEach((pixel, y) => {
        this.erase_single_pixel(x, y);
        this.paint_single_pixel(x, y, pixel);
      })
    );
  }
}

customElements.define("drawing-canvas", DrawingCanvas);
