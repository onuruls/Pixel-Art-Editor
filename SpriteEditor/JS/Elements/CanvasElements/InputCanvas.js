import { SpriteCanvas } from "../SpriteCanvas.js";

export class InputCanvas extends HTMLElement {
  /**
   * Top-Level Canvas
   * Handles all the mouse events
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
    this.init();
  }
  render() {
    return `<canvas></canvas>`;
  }
  /**
   * Initializes the Canvas
   */
  init() {
    this.canvas.height = 640;
    this.canvas.width = 640;
    this.sprite_canvas.addEventListener("canvas_resized", (event) => {
      this.canvas.width = event.detail.width;
      this.canvas.height = event.detail.height;
    });
    this.canvas.addEventListener("mousedown", (event) => {
      this.sprite_editor.selected_tool.mouse_down(event);
    });
    this.canvas.addEventListener("pointermove", (event) => {
      const events = event.getCoalescedEvents();
      for (const e of events) {
        this.movecounter++;
        this.sprite_editor.selected_tool.mouse_move(e);
      }
      this.sprite_editor.selected_tool.mouse_move(event);
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.sprite_editor.selected_tool.mouse_up(event);
    });
    this.canvas.addEventListener("mouseleave", (event) => {
      this.sprite_editor.remove_hover();
    });
    window.addEventListener("mouseup", (event) => {
      this.sprite_editor.selected_tool.global_mouse_up(event);
    });
  }
}

customElements.define("input-canvas", InputCanvas);
