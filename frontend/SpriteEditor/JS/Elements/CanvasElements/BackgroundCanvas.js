import { CanvasElement } from "./CanvasElement.js";

export class BackgroundCanvas extends CanvasElement {
  /**
   * Renders the background
   * @param {SpriteCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
    this.line_color = "#444";
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
   * Draws the backgorund grid
   */
  draw_background_grid() {
    const tile_size = this.sprite_editor.tile_size;
    const scale = this.sprite_editor.scale;
    this.revert_canvas();
    this.context.strokeStyle = this.line_color;
    this.context.lineWidth = 1;
    this.context.strokeRect(
      0,
      0,
      tile_size * this.sprite_editor.width,
      tile_size * this.sprite_editor.height
    );
    for (let i = 0; i < this.sprite_editor.width; i++) {
      this.context.beginPath();
      this.context.moveTo(+i * tile_size, 0);
      this.context.lineTo(i * tile_size, this.sprite_editor.height * tile_size);
      this.context.stroke();
    }

    for (let i = 0; i < this.sprite_editor.height; i++) {
      this.context.beginPath();
      this.context.moveTo(0, +i * tile_size);
      this.context.lineTo(this.sprite_editor.width * tile_size, i * tile_size);
      this.context.stroke();
    }
  }
}

customElements.define("sprite-background-canvas", BackgroundCanvas);
