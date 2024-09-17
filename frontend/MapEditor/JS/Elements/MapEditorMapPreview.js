import { Util } from "../../../Util/Util.js";
import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorMapPreview extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.canvas = this.create_preview_canvas();
    this.context = this.canvas.getContext("2d");
    this.tile_size = 0;
  }

  /**
   * Creates the canvas for the preview
   * @returns {HTMLCanvasElement}
   */
  create_preview_canvas() {
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
    this.map_editor.addEventListener("reload_map_preview", () => {
      this.reload_preview();
    });
    this.resize_canvas();
  }

  resize_canvas() {
    const height_tile_size = 200 / this.map_editor.height;
    const width_tile_size = 300 / this.map_editor.width;
    this.tile_size = Math.min(height_tile_size, width_tile_size);
    this.canvas.height = this.tile_size * this.map_editor.height;
    this.canvas.width = this.tile_size * this.map_editor.width;
  }

  /**
   * Reloads the preview after changes
   */
  reload_preview() {
    this.clear_canvas();
    const combined_matrix = this.map_editor.layer_manager.combine_layers();
    combined_matrix.forEach((col, col_i) =>
      col.forEach((asset, row_i) => {
        this.draw_single_tile(col_i, row_i, asset);
      })
    );
  }

  /**
   * Clears the preview canvas
   */
  clear_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
      this.context.drawImage(
        img,
        x * this.tile_size,
        y * this.tile_size,
        this.tile_size,
        this.tile_size
      );
    }
  }
}

customElements.define("map-editor-map-preview", MapEditorMapPreview);
