import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class InputCanvas extends CanvasElement {
  /**
   * Top-Level Canvas
   * Handles all the mouse events
   * @param {MapEditorCanvas} canvas
   */
  constructor(canvas) {
    super(canvas);
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
    this.canvas.addEventListener("canvas_resized", (event) => {
      this.canvas.width = event.detail.width;
      this.canvas.height = event.detail.height;
    });

    // const handleHover = (event) => {
    //   const rect = this.canvas.getBoundingClientRect();
    //   const x = Math.floor(
    //     (event.clientX - rect.left) / (10 * this.map_editor.scale)
    //   );
    //   const y = Math.floor(
    //     (event.clientY - rect.top) / (10 * this.map_editor.scale)
    //   );
    //   this.map_editor.hover_canvas_matrix(x, y);
    // };

    this.canvas.addEventListener("mousedown", (event) => {
      this.map_editor.selected_tool.mouse_down(event);
    });
    this.canvas.addEventListener("mousemove", (event) => {
      this.map_editor.selected_tool.mouse_move(event);
      // handleHover(event);
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.map_editor.selected_tool.mouse_up(event);
    });
    this.canvas.addEventListener("mouseleave", () =>
      this.map_editor.remove_hover()
    );
    window.addEventListener("mouseup", (event) =>
      this.map_editor.selected_tool.global_mouse_up(event)
    );
  }
}

customElements.define("map-input-canvas", InputCanvas);
