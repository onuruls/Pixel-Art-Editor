import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";
import { ColorUtil } from "../../../../Util/ColorUtil.js";

export class TempCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.context = null;
    this.selection_color = [196, 252, 250, 123];
    this.draw_shape_bind = this.draw_shape.bind(this);
    this.revert_canvas_bind = this.revert_canvas.bind(this);
    this.update_selected_area_bind = this.update_selected_area.bind(this);
    this.selected_area_copied_bind = this.selected_area_copied.bind(this);
    this.remove_selected_bind = this.remove_selection.bind(this);
  }

  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the Canvas
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.sprite_editor.addEventListener(
      "draw_temp_shape",
      this.draw_shape_bind
    );
    this.sprite_editor.addEventListener("draw_shape", this.revert_canvas_bind);
    this.sprite_editor.addEventListener(
      "update_selected_area",
      this.update_selected_area_bind
    );
    this.sprite_editor.addEventListener(
      "selected_area_copied",
      this.selected_area_copied_bind
    );
    this.sprite_editor.addEventListener(
      "remove_selection",
      this.remove_selected_bind
    );
  }

  disconnectedCallback() {
    this.sprite_editor.removeEventListener(
      "draw_temp_shape",
      this.draw_shape_bind
    );
    this.sprite_editor.removeEventListener(
      "draw_shape",
      this.revert_canvas_bind
    );
    this.sprite_editor.removeEventListener(
      "update_selected_area",
      this.update_selected_area_bind
    );
    this.sprite_editor.removeEventListener(
      "selected_area_copied",
      this.selected_area_copied_bind
    );
    this.sprite_editor.removeEventListener(
      "remove_selection",
      this.remove_selected_bind
    );
  }

  /**
   * Draws shapes on the matrix (rectangle, circle, line)
   * @param {Event} event
   */
  draw_shape(event) {
    const selected_color = event.detail.color;
    const points = event.detail.points;
    this.revert_canvas();
    points.forEach((point) => {
      this.paint_single_pixel(point.x, point.y, selected_color);
    });
  }

  /**
   * Draws the selected area
   * @param {Event} event
   */
  update_selected_area(event) {
    this.revert_canvas();
    const points = event.detail.points;
    points.forEach((point) => {
      const color = point.selection_color || this.selection_color;
      this.paint_single_pixel(point.x, point.y, color);
    });
  }

  /**
   * Called when the selected area is copied
   * Copies the selected pixels to the selected_area to
   * show what has been copied
   * @param {Event} event
   */
  selected_area_copied(event) {
    this.revert_canvas();
    const points = event.detail.points;
    points.forEach((point) => {
      const blended_color_string = ColorUtil.blend_colors(
        ColorUtil.rgba_array_to_string(this.selection_color),
        ColorUtil.rgba_array_to_string(point.original_color)
      );
      const blended_color_array =
        ColorUtil.rgba_string_to_array(blended_color_string);
      this.paint_single_pixel(point.x, point.y, blended_color_array);
    });
  }

  /**
   * Removes the selected area
   */
  remove_selection() {
    this.revert_canvas();
  }

  /**
   * Paints a single pixel on the canvas.
   * @param {Number} x - The x-coordinate.
   * @param {Number} y - The y-coordinate.
   * @param {Array<Number> | String} color - The color as an array or rgba string.
   */
  paint_single_pixel(x, y, color) {
    const ctx = this.context;
    let fillStyle;
    if (Array.isArray(color)) {
      fillStyle = ColorUtil.rgba_array_to_string(color);
    } else if (typeof color === "string") {
      fillStyle = color;
    } else {
      throw new Error("Invalid color format");
    }
    ctx.fillStyle = fillStyle;
    const tile_size = this.sprite_canvas.sprite_editor.tile_size;
    ctx.fillRect(x * tile_size, y * tile_size, tile_size, tile_size);
  }

  /**
   * Clears the temporary canvas.
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

customElements.define("temp-canvas", TempCanvas);
