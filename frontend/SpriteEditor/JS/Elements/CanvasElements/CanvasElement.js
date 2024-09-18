import { SpriteCanvas } from "../SpriteCanvas.js";

export class CanvasElement extends HTMLElement {
  /**
   * Parent-Class for the different canvas elements
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super();
    this.sprite_canvas = sprite_canvas;
    this.sprite_editor = sprite_canvas.sprite_editor;
    this.canvas = null;
  }

  connectedCallback() {
    this.innerHTML = this.render();
    this.canvas = this.querySelector("canvas");
    this.context = this.canvas.getContext("2d");
    this.init();
  }

  /**
   * Malt ein Pixel in der angegebenen Farbe.
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} color
   */
  paint_single_pixel(x, y, color) {
    const tile_size = this.sprite_editor.tile_size;
    const color_str = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${
      color[3] / 255
    })`;

    this.context.fillStyle = color_str;
    this.context.fillRect(x * tile_size, y * tile_size, tile_size, tile_size);
  }

  /**
   * Clears a pixel from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  erase_single_pixel(x, y) {
    const tile_size = this.sprite_editor.tile_size;
    this.context.clearRect(x * tile_size, y * tile_size, tile_size, tile_size);
  }

  /**
   * Mixes to Colors into one
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   */
  mix_colors(color1, color2) {
    return [
      Math.round((color1[0] + color2[0]) / 2),
      Math.round((color1[1] + color2[1]) / 2),
      Math.round((color1[2] + color2[2]) / 2),
      128,
    ];
  }

  /**
   * Clears the whole canvas
   */
  revert_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
