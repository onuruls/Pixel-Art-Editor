import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class TempCanvas extends CanvasElement {
  /**
   * Intermediate level Canvas
   * Shows temporary pixel like the selection area
   * or shapes when they are not finished
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.draw_temp_shape_bind = this.draw_temp_shape.bind(this);
    this.update_selected_area_bind = this.update_selected_area.bind(this);
    this.remove_selection_bind = this.remove_selection.bind(this);
    this.selection_color = [196, 252, 250, 123];
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the Canvas
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.map_editor.addEventListener(
      "draw_temp_shape",
      this.draw_temp_shape_bind
    );
    this.map_editor.addEventListener(
      "update_selected_area",
      this.update_selected_area_bind
    );
    this.map_editor.addEventListener(
      "remove_selection",
      this.remove_selection_bind
    );
  }

  /**
   * Draws a temporary shape while mousebutton is down
   * @param {Event} event
   */
  draw_temp_shape(event) {
    this.revert_canvas();
    this.draw_shape(event);
  }

  /**
   * Draws the selected area
   * @param {Event} event
   */
  update_selected_area(event) {
    this.revert_canvas();
    const points = event.detail.points;
    const tile_size = this.map_editor.tile_size;
    const scale = this.map_editor.scale;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
      const asset = point.original_asset;
      const x = point.x * tile_size * scale;
      const y = point.y * tile_size * scale;
      const color_str = this.color_array_to_string(this.selection_color);
      if (asset && asset !== "") {
        this.paint_single_pixel(point.x, point.y, asset);
      }
      this.context.fillStyle = color_str;
      this.context.fillRect(x, y, tile_size * scale, tile_size * scale);
    });
  }

  /**
   * Draws the selected Area, when selection is copied
   * @param {Event} event
   */
  selected_area_copied(event) {
    const points = event.detail.points;
    const tile_size = this.map_editor.tile_size;
    const scale = this.map_editor.scale;
    this.revert_canvas();
    points.forEach((point) => {
      const x = point.x * tile_size * scale;
      const y = point.y * tile_size * scale;
      this.paint_single_pixel(x, y, point.original_asset);
      const color_str = this.color_array_to_string(this.selection_color);
      this.context.fillStyle = color_str;
      this.context.fillRect(x, y, tile_size * scale, tile_size * scale);
    });
  }

  /**
   * Removes the selected area
   * @param {Event} event
   */
  remove_selection(event) {
    this.revert_canvas();
  }

  disable_listeners() {
    this.map_editor.removeEventListener(
      "draw_temp_shape",
      this.draw_temp_shape_bind
    );
    this.map_editor.removeEventListener(
      "update_selected_area",
      this.update_selected_area_bind
    );
    this.map_editor.removeEventListener(
      "remove_selection",
      this.remove_selection_bind
    );
  }
}

customElements.define("map-temp-canvas", TempCanvas);
