import { MapEditorCanvas } from "../MapEditorCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class InputCanvas extends CanvasElement {
  /**
   * Top-Level Canvas
   * Handles all the mouse events
   * @param {MapEditorCanvas} map_canvas
   */
  constructor(map_canvas) {
    super(map_canvas);
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
    this.canvas.height = 640;
    this.canvas.width = 640;
    this.map_canvas.addEventListener("canvas_resized", (event) => {
      this.canvas.width = event.detail.width;
      this.canvas.height = event.detail.height;
    });
    this.canvas.addEventListener("mousedown", (event) => {
      this.map_editor.selected_tool.mouse_down(event);
    });
    this.canvas.addEventListener("mousemove", (event) => {
      this.map_editor.selected_tool.mouse_move(event);
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.map_editor.selected_tool.mouse_up(event);
    });
    this.canvas.addEventListener("mouseleave", (event) => {
      this.map_editor.remove_hover();
    });
    window.addEventListener("mouseup", (event) => {
      this.map_editor.selected_tool.global_mouse_up(event);
    });
  }
}

customElements.define("map-input-canvas", InputCanvas);
