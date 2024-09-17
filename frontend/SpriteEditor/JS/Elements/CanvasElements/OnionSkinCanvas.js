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
    this.is_onion_skin_active = false;
    this.onion_skin_button = this.create_onion_skin_button();
  }

  /**
   * @returns {string}
   */
  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the canvas and sets up event listeners.
   * Also sets up a MutationObserver to lazily add the onion skin toggle button.
   */
  init() {
    this.context = this.canvas.getContext("2d");

    const observer = new MutationObserver(() => {
      this.add_onion_skin_button(observer);
    });
    observer.observe(this.sprite_editor, { childList: true, subtree: true });

    this.sprite_editor.addEventListener("repaint_canvas", () => {
      if (this.is_onion_skin_active) {
        this.update_onion_skin();
      }
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
    const tile_size = this.sprite_editor.tile_size;
    this.context.fillRect(x * tile_size, y * tile_size, tile_size, tile_size);
  }

  /**
   * Toggles the Onion Skin functionality.
   */
  toggle_onion_skin() {
    this.is_onion_skin_active = !this.is_onion_skin_active;
    if (this.is_onion_skin_active) {
      this.update_onion_skin();
    } else {
      this.clear_canvas();
    }
    this.onion_skin_button.classList.toggle(
      "active",
      this.is_onion_skin_active
    );
  }

  /**
   * Button to toggle onion skin
   * @returns {HTMLButtonElement}
   */
  create_onion_skin_button() {
    const button = document.createElement("button");
    button.setAttribute("id", "onion_skin_button");

    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-circle");

    button.appendChild(icon);
    return button;
  }

  /**
   * Attempts to add the onion skin toggle button to the animation preview controls.
   * Disconnects the observer once the button is added.
   *
   * @param {MutationObserver} observer
   */
  add_onion_skin_button(observer) {
    const animationPreviewControls = this.sprite_editor.querySelector(
      "animation-preview-controls"
    );
    if (animationPreviewControls) {
      animationPreviewControls.appendChild(this.onion_skin_button);
      this.onion_skin_button.addEventListener(
        "click",
        this.toggle_onion_skin.bind(this)
      );
      observer.disconnect();
    }
  }
}

customElements.define("onion-skin-canvas", OnionSkinCanvas);
