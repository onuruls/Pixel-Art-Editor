import { CanvasElement } from "./CanvasElement.js";
import { ColorUtil } from "../../../../Util/ColorUtil.js";

export class BackgroundCanvas extends CanvasElement {
  /**
   * Renders the background
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.line_color = ColorUtil.canvas_line_color;
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
  }

  /**
   * Draws the background grid
   */
  draw_background_grid() {
    const tile_size = this.map_editor.tile_size;
    const scale = this.map_editor.scale;
    this.revert_canvas();
    this.context.strokeStyle = this.line_color;
    this.context.lineWidth = 2;
    this.context.strokeRect(
      0,
      0,
      tile_size * this.map_editor.width * scale,
      tile_size * this.map_editor.height * scale
    );
    for (let i = 0; i < this.map_editor.width; i++) {
      this.context.beginPath();
      this.context.moveTo(i * tile_size * scale, 0);
      this.context.lineTo(
        i * tile_size * scale,
        this.map_editor.height * tile_size * scale
      );
      this.context.stroke();
    }

    for (let i = 0; i < this.map_editor.height; i++) {
      this.context.beginPath();
      this.context.moveTo(0, i * tile_size * scale);
      this.context.lineTo(
        this.map_editor.width * tile_size * scale,
        i * tile_size * scale
      );
      this.context.stroke();
    }
  }

  /**
   * Clears the background canvas.
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

customElements.define("map-background-canvas", BackgroundCanvas);
