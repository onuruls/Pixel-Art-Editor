import { SpriteCanvas } from "../SpriteCanvas.js";
import { CanvasElement } from "./CanvasElement.js";

export class InputCanvas extends CanvasElement {
  /**
   * Top-Level Canvas
   * Handles all the mouse events
   * @param {SpriteCanvas} sprite_canvas
   */
  constructor(sprite_canvas) {
    super(sprite_canvas);
    this.canvas_mouseleave_bind = this.canvas_mouseleave.bind(this);
  }

  render() {
    return `<canvas></canvas>`;
  }

  /**
   * Initializes the Canvas
   */
  init() {
    this.canvas.addEventListener("mouseleave", this.canvas_mouseleave_bind);
  }

  disconnectedCallback() {
    this.remove_listeners();
  }

  remove_listeners() {
    this.canvas.removeEventListener("mousedown", this.canvas_mousedown_bind);
    this.canvas.removeEventListener(
      "pointermove",
      this.canvas_pointermove_bind
    );
    this.canvas.removeEventListener("mouseup", this.canvas_mouseup_bind);
    window.removeEventListener("mouseup", this.window_mouseup_bind);
  }

  /**
   * Remove old bindings when tool is changed and create new bindings
   * so the EventListeners can be removed, when the element
   * is removed from the DOM
   */
  set_tool_listeners() {
    this.remove_listeners();
    this.canvas_mousedown_bind =
      this.sprite_editor.selected_tool.mouse_down.bind(
        this.sprite_editor.selected_tool
      );
    this.canvas_mouseup_bind = this.sprite_editor.selected_tool.mouse_up.bind(
      this.sprite_editor.selected_tool
    );
    this.window_mouseup_bind =
      this.sprite_editor.selected_tool.global_mouse_up.bind(
        this.sprite_editor.selected_tool
      );
    this.canvas_pointermove_bind = this.canvas_pointermove.bind(this);
    this.canvas.addEventListener("mousedown", this.canvas_mousedown_bind);
    this.canvas.addEventListener("pointermove", this.canvas_pointermove_bind);
    this.canvas.addEventListener("mouseup", this.canvas_mouseup_bind);
    window.addEventListener("mouseup", this.window_mouseup_bind);
  }

  /**
   * Called when pointer moves on the canvas
   * @param {Event} event
   */
  canvas_pointermove(event) {
    const events = event.getCoalescedEvents();
    for (const e of events) {
      this.sprite_editor.selected_tool.mouse_move(e);
    }
    this.sprite_editor.selected_tool.mouse_move(event);
  }

  /**
   * Called when the mouse leaves the canvas
   * @param {Event} event
   */
  canvas_mouseleave(event) {
    this.sprite_editor.remove_hover();
    this.sprite_editor.clear_changed_points();
  }
}

customElements.define("input-canvas", InputCanvas);
