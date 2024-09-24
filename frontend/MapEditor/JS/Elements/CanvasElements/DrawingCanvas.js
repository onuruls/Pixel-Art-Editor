import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class DrawingCanvas extends CanvasElement {
  /**
   * Bottom level Canvas
   * Shows the drawing
   * @param {MapEditorCanvas} canvas
   * @param {number} layerIndex
   */
  constructor(canvas, layerIndex) {
    super(canvas);
    this.layerIndex = layerIndex;
    this._active = true;
    this.layers_updated_bind = this.layers_updated.bind(this);
    this.draw_pen_canvas_bind = this.draw_pen_canvas.bind(this);
    this.erase_canvas_bind = this.erase_canvas.bind(this);
    this.redraw_canvas_bind = this.redraw_canvas.bind(this);
    this.draw_shape_bind = this.draw_shape.bind(this);
    this.fill_matrix_changed_bind = this.fill_matrix_changed.bind(this);
    this.paste_selected_area_bind = this.paste_selected_area.bind(this);
    this.cut_selected_area_bind = this.cut_selected_area.bind(this);
  }

  set active(value) {
    this._active = value;
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
    this.context = this.querySelector("canvas").getContext("2d");
    this.enable_listeners();
  }

  /**
   * Sets the active/inactive state of the DrawingCanvas, when layers are updated
   * @param {Event} event
   */
  layers_updated(event) {
    if (this.map_editor.layer_manager.active_layer_index === this.layerIndex) {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  /**
   * Enables all the EventlIsteners of the DrawingCanvas
   */
  enable_listeners() {
    this.map_editor.addEventListener(
      "layers-updated",
      this.layers_updated_bind
    );
    this.map_editor.addEventListener(
      "pen_matrix_changed",
      this.draw_pen_canvas_bind
    );
    this.map_editor.addEventListener(
      "eraser_matrix_changed",
      this.erase_canvas_bind
    );
    this.map_editor.addEventListener("zoom_changed", this.redraw_canvas_bind);
    this.map_editor.addEventListener("draw_shape", this.draw_shape_bind);
    this.map_editor.addEventListener(
      "fill_matrix_changed",
      this.fill_matrix_changed_bind
    );
    this.map_editor.addEventListener(
      "paste_selected_area",
      this.paste_selected_area_bind
    );
    this.map_editor.addEventListener(
      "cut_selected_area",
      this.cut_selected_area_bind
    );
  }

  /**
   * Disables all the EventListeners of the canvas
   * Called when disconnected from DOM
   */
  disable_listeners() {
    this.map_editor.addEventListener(
      "layers-updated",
      this.layers_updated_bind
    );
    this.removeEventListener("pen_matrix_changed", this.draw_pen_canvas_bind);
    this.removeEventListener("eraser_matrix_changed", this.erase_canvas_bind);
    this.map_editor.removeEventListener(
      "zoom_changed",
      this.redraw_canvas_bind
    );
    this.map_editor.removeEventListener("draw_shape", this.draw_shape_bind);
    this.map_editor.removeEventListener(
      "fill_matrix_changed",
      this.fill_matrix_changed_bind
    );
    this.map_editor.removeEventListener(
      "paste_selected_area",
      this.paste_selected_area_bind
    );
    this.map_editor.removeEventListener(
      "cut_selected_area",
      this.cut_selected_area_bind
    );
  }

  /**
   * Checks if the DrawingCanvas is active
   * Draws the shape on the canvas
   */

  draw_shape(event) {
    if (!this._active) return;
    super.draw_shape(event);
  }
  /**
   * Handles drawing with the pen tool
   * @param {Event} event
   */
  draw_pen_canvas(event) {
    if (!this._active) return;
    const pixel_size = this.map_editor.tile_size * this.map_editor.scale;
    const asset = event.detail.asset;
    const x = event.detail.x * pixel_size;
    const y = event.detail.y * pixel_size;
    this.context.drawImage(asset, x, y, pixel_size, pixel_size);
  }

  /**
   * Handles erasing on the canvas
   * @param {Event} event
   */
  erase_canvas(event) {
    if (!this._active) return;
    const pixel_size = this.map_editor.tile_size * this.map_editor.scale;
    const x = event.detail.x * pixel_size;
    const y = event.detail.y * pixel_size;
    this.context.clearRect(x, y, pixel_size, pixel_size);
  }

  /**
   * Reverts the last action from the action_stack in the map_editor
   * @param {Event} point
   */
  revert_redo(point) {
    if (!this._active) return;
    this.erase_single_pixel(point.x, point.y);
    this.paint_single_pixel(point.x, point.y, point.asset);
  }

  /**
   * Redoes the last undo-action from the action stack
   * @param {Event} point
   */
  revert_undo(point) {
    if (!this._active) return;
    this.erase_single_pixel(point.x, point.y);
    this.paint_single_pixel(point.x, point.y, point.prev_asset);
  }

  /**
   * Redraws the current layer on the canvas
   */
  redraw_canvas() {
    this.clear_canvas();
    this.draw_content();
  }

  /**
   * Clears the canvas context
   */
  clear_canvas() {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the content of the current layer onto the canvas
   */
  draw_content() {
    const content =
      this.map_editor.layer_manager.layers[this.layerIndex].content;
    content.forEach((row, x) => {
      row.forEach((pixel, y) => {
        if (pixel) {
          this.paint_single_pixel(x, y, pixel);
        }
      });
    });
  }

  /**
   * FIlls a section of the canvas
   * @param {Event} event
   */
  fill_matrix_changed(event) {
    if (!this._active) return;
    const tile_size = this.map_editor.tile_size;
    const points = event.detail.points;
    const asset = event.detail.asset;
    points.forEach((point) => {
      const x = point.x * tile_size;
      const y = point.y * tile_size;
      this.context.clearRect(x, y, tile_size, tile_size);
      this.context.drawImage(
        asset,
        point.x * tile_size,
        point.y * tile_size,
        tile_size,
        tile_size
      );
    });
  }

  /**
   * Pastes the selected tiles into the map
   * @param {Event} event
   */
  paste_selected_area(event) {
    if (!this._active) return;
    const points = event.detail.points;
    points.forEach((point) => {
      const asset = point.original_asset;
      if (asset && asset !== "") {
        this.erase_single_pixel(point.x, point.y);
        this.paint_single_pixel(point.x, point.y, asset);
      }
    });
  }

  /**
   * Rerenders the selected points that have been cut out of the map
   * @param {Event} event
   */
  cut_selected_area(event) {
    if (!this._active) return;
    const points = event.detail.points;
    points.forEach((point) => {
      this.erase_single_pixel(point.x, point.y);
    });
  }
}

customElements.define("map-drawing-canvas", DrawingCanvas);
