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
    this.canvas_resized_bind = this.canvas_resized.bind(this);
    this.mouseleave_bind = this.map_editor.remove_hover.bind(this.map_editor);
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
    this.canvas.addEventListener("canvas_resized", this.canvas_resized_bind);
    this.canvas.addEventListener("mouseleave", this.mouseleave_bind);
  }

  /**
   * Called when the canvas size changed
   * @param {Event} event
   */
  canvas_resized(event) {
    this.canvas.width = event.detail.width;
    this.canvas.height = event.detail.height;
  }

  /**
   * Disables all the EventListeners of the canvas
   * Called when disconnected from DOM
   */
  disable_listeners() {
    this.canvas.removeEventListener("canvas_resized", this.canvas_resized_bind);
    this.canvas.removeEventListener("mousedown", this.mousedown_bind);
    this.canvas.removeEventListener("mousemove", this.mousemove_bind);
    this.canvas.removeEventListener("mouseup", this.mouseup_bind);
    this.canvas.removeEventListener("mouseleave", this.mouseleave_bind);
    window.removeEventListener("mouseup", this.window_mouseup_bind);
  }

  /**
   * Renews the bindings when selected_tool is changed
   */
  set_tool_liseners() {
    // Remove old listeners
    this.canvas.removeEventListener("mousedown", this.mousedown_bind);
    this.canvas.removeEventListener("mousemove", this.mousemove_bind);
    this.canvas.removeEventListener("mouseup", this.mouseup_bind);
    window.removeEventListener("mouseup", this.window_mouseup_bind);
    // Renew bindings
    this.mousedown_bind = this.map_editor.selected_tool.mouse_down.bind(
      this.map_editor.selected_tool
    );
    this.mousemove_bind = this.map_editor.selected_tool.mouse_move.bind(
      this.map_editor.selected_tool
    );
    this.mouseup_bind = this.map_editor.selected_tool.mouse_up.bind(
      this.map_editor.selected_tool
    );
    this.window_mouseup_bind =
      this.map_editor.selected_tool.global_mouse_up.bind(
        this.map_editor.selected_tool
      );
    // Set new listeners
    this.canvas.addEventListener("mousedown", this.mousedown_bind);
    this.canvas.addEventListener("mousemove", this.mousemove_bind);
    this.canvas.addEventListener("mouseup", this.mouseup_bind);
    window.addEventListener("mouseup", this.window_mouseup_bind);
  }
}

customElements.define("map-input-canvas", InputCanvas);
