import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

/**
 * OnionSkinCanvas is responsible for rendering onion-skin layers in the sprite editor.
 */
export class OnionSkinCanvas extends CanvasElement {
  /**
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.context = null;
    this.opacity = 0.25;
  }

  /**
   * @returns {string}
   */
  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the canvas and sets up event listeners.
   */
  init() {
    this.context = this.canvas.getContext("2d");
    this.canvas.height = 640;
    this.canvas.width = 640;

    this.sprite_editor.addEventListener("repaint_canvas", () => {
      this.update_onion_skin();
    });

    this.sprite_editor.addEventListener("remove_selection", () => {
      this.clear_canvas();
    });
  }

  /**
   * Updates the onion skin by clearing the canvas and redrawing the previous and next frames.
   */
  update_onion_skin() {
    this.clear_canvas();
    const currentFrameIndex = this.sprite_editor.current_frame_index;
    console.log(currentFrameIndex);

    if (currentFrameIndex > 0) {
      this.draw_frame(
        this.sprite_editor.canvas_matrices[currentFrameIndex - 1]
      );
    }

    if (currentFrameIndex < this.sprite_editor.canvas_matrices.length - 1) {
      this.draw_frame(
        this.sprite_editor.canvas_matrices[currentFrameIndex + 1]
      );
    }
  }

  /**
   * Draws a frame onto the onion skin canvas with the specified transparency.
   * @param {Array<Array<Array<number>>>} frame_matrix
   */
  draw_frame(frame_matrix) {
    this.context.globalAlpha = this.opacity;
    frame_matrix.forEach((row, x) => {
      row.forEach((pixel, y) => {
        if (pixel[3] !== 0) {
          this.paint_single_pixel(x, y, pixel);
        }
      });
    });
  }

  /**
   * Clears the onion skin canvas.
   */
  clear_canvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Paints a single pixel on the canvas at the specified coordinates.
   * @param {number} x
   * @param {number} y
   * @param {Array<number>} color
   */
  paint_single_pixel(x, y, color) {
    this.context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${
      color[3] / 255
    })`;
    this.context.fillRect(x * 10, y * 10, 10, 10);
  }
}

customElements.define("onion-skin-canvas", OnionSkinCanvas);
