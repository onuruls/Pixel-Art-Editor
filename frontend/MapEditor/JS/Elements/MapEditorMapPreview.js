import { Util } from "../../../Util/Util.js";
import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorMapPreview extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.canvas = this.create_canvas();
    this.zoom_canvas = this.create_canvas();
    this.preview_context = this.canvas.getContext("2d");
    this.zoom_context = this.zoom_canvas.getContext("2d");
    this.navigating = false;
    this.tile_size = 0;
    this.reload_preview_bind = this.reload_preview.bind(this);
    this.update_zoom_bind = this.update_zoom.bind(this);
    this.mouse_down_bind = this.mouse_down.bind(this);
    this.mouse_move_bind = this.mouse_move.bind(this);
    this.mouse_up_bind = this.mouse_up.bind(this);
  }

  /**
   * Creates the canvas for the preview
   * @returns {HTMLCanvasElement}
   */
  create_canvas() {
    return Util.create_element("canvas");
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
      `;
  }

  init() {
    this.appendChild(this.canvas);
    this.appendChild(this.zoom_canvas);
  }

  set_listeners() {
    this.map_editor.addEventListener(
      "reload_map_preview",
      this.reload_preview_bind
    );
    this.map_editor.addEventListener("zoom_changed", this.update_zoom_bind);
    this.map_editor.canvas_wrapper.addEventListener(
      "scroll",
      this.update_zoom_bind
    );
    this.resize_canvas();
    this.zoom_canvas.addEventListener("mousedown", this.mouse_down_bind);
    this.zoom_canvas.addEventListener("mousemove", this.mouse_move_bind);
    document.addEventListener("mouseup", this.mouse_up_bind);
  }

  disconnectedCallback() {
    this.map_editor.removeEventListener(
      "reload_map_preview",
      this.reload_preview_bind
    );
    this.map_editor.removeEventListener("zoom_changed", this.update_zoom_bind);
    this.map_editor.canvas_wrapper.removeEventListener(
      "scroll",
      this.update_zoom_bind
    );
    this.zoom_canvas.removeEventListener("mousedown", this.mouse_down_bind);
    this.zoom_canvas.removeEventListener("mousemove", this.mouse_move_bind);
    document.removeEventListener("mouseup", this.mouse_up_bind);
  }

  mouse_down() {
    this.navigating = true;
    this.scroll_to_click(event);
  }

  mouse_move() {
    if (this.navigating) {
      this.scroll_to_click(event);
    }
  }

  mouse_up() {
    this.navigating = false;
  }

  /**
   * Resizes the canvas to the same ratio as the map
   */
  resize_canvas() {
    const height_tile_size = 200 / this.map_editor.height;
    const width_tile_size = 300 / this.map_editor.width;
    this.tile_size = Math.min(height_tile_size, width_tile_size);
    this.canvas.height = this.tile_size * this.map_editor.height;
    this.canvas.width = this.tile_size * this.map_editor.width;
    this.zoom_canvas.height = this.tile_size * this.map_editor.height;
    this.zoom_canvas.width = this.tile_size * this.map_editor.width;
  }

  /**
   * Reloads the preview after changes
   */
  reload_preview() {
    this.clear_map_canvas();
    const combined_matrix = this.map_editor.layer_manager.combine_layers();
    const flat_matrix = combined_matrix.flat();
    const unique_assets = [...new Set(flat_matrix)];
    combined_matrix.forEach((col, col_i) =>
      col.forEach((asset, row_i) => {
        this.draw_single_tile(col_i, row_i, asset);
      })
    );
  }

  /**
   * Clears the preview canvas
   */
  clear_map_canvas() {
    this.preview_context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Paints a single tile to the previewCanvas
   * @param {Number} x
   * @param {Number} y
   * @param {String} asset
   */
  draw_single_tile(x, y, asset) {
    const img = this.map_editor.image_cache[asset];
    if (img) {
      this.preview_context.drawImage(
        img,
        x * this.tile_size,
        y * this.tile_size,
        this.tile_size,
        this.tile_size
      );
    } else {
      this.preview_context.clearRect(
        x * this.tile_size,
        y * this.tile_size,
        this.tile_size,
        this.tile_size
      );
    }
  }

  /**
   * Updates the zoom canvas rectangle when the zoom
   * changed
   */
  update_zoom() {
    this.clear_zoom_canvas();
    const scale = this.map_editor.scale;
    const width = this.zoom_canvas.width / scale;
    const height = this.zoom_canvas.height / scale;
    const [x, y] = this.get_view_position();
    this.zoom_context.strokeStyle = "red";
    this.zoom_context.strokeRect(x, y, width, height);
  }

  /**
   * Clears the zoom canvas
   */
  clear_zoom_canvas() {
    this.zoom_context.clearRect(
      0,
      0,
      this.zoom_canvas.width,
      this.zoom_canvas.height
    );
  }

  /**
   * Gets the position of the current view
   * @returns {[Number, Number]}
   */
  get_view_position() {
    const wrapper = this.map_editor.canvas_wrapper;
    const height = wrapper.scrollHeight;
    const width = wrapper.scrollWidth;
    const scroll_left = wrapper.scrollLeft;
    const scroll_top = wrapper.scrollTop;
    const x = (scroll_left / width) * this.zoom_canvas.width;
    const y = (scroll_top / height) * this.zoom_canvas.height;
    return [x, y];
  }

  /**
   * Calculates the scroll position from the click position
   * and scrolls the canvas_wrapper to the location
   * @param {Event} event
   */
  scroll_to_click(event) {
    const scale = this.map_editor.scale;
    const width = this.zoom_canvas.width / scale;
    const height = this.zoom_canvas.height / scale;
    const relativeX = event.offsetX;
    const relativeY = event.offsetY;
    const x = Math.max(
      0,
      Math.min(relativeX - width / 2, this.zoom_canvas.width - width / 2)
    );
    const y = Math.max(
      0,
      Math.min(relativeY - height / 2, this.zoom_canvas.height - height / 2)
    );
    const x_ratio = x / this.zoom_canvas.width;
    const y_ratio = y / this.zoom_canvas.height;
    const scroll_x = x_ratio * this.map_editor.canvas_wrapper.scrollWidth;
    const scroll_y = y_ratio * this.map_editor.canvas_wrapper.scrollHeight;
    this.map_editor.scroll_to_location(scroll_x, scroll_y);
  }
}

customElements.define("map-editor-map-preview", MapEditorMapPreview);
