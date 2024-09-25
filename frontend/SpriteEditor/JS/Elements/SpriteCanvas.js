import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { SpriteEditor } from "./SpriteEditor.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";
import { TempCanvas } from "./CanvasElements/TempCanvas.js";
import { HoverCanvas } from "./CanvasElements/HoverCanvas.js";
import { InputCanvas } from "./CanvasElements/InputCanvas.js";
import { OnionSkinCanvas } from "./CanvasElements/OnionSkinCanvas.js";
import { BackgroundCanvas } from "./CanvasElements/BackgroundCanvas.js";

export class SpriteCanvas extends SpriteEditorPart {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    super(sprite_editor);
    this.shape_holder = [];
    this.selected_points_holder = [];
    this.background_canvas = new BackgroundCanvas(this);
    this.onion_skin_canvas = new OnionSkinCanvas(this);
    this.drawing_canvas = new DrawingCanvas(this);
    this.temp_canvas = new TempCanvas(this);
    this.hover_canvas = new HoverCanvas(this);
    this.input_canvas = new InputCanvas(this);
    this.canvas_wrapper = null;
    this.contextmenu_bind = this.contextmenu.bind(this);
    this.canvas_array = [
      this.background_canvas,
      this.onion_skin_canvas,
      this.drawing_canvas,
      this.temp_canvas,
      this.hover_canvas,
      this.input_canvas,
    ];
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `<div class="canvas-wrapper"></div>`;
  }

  /**
   * place for all the event listener
   */
  init() {
    this.canvas_wrapper = this.querySelector(".canvas-wrapper");
    this.canvas_wrapper.append(this.background_canvas);
    this.canvas_wrapper.append(this.drawing_canvas);
    this.canvas_wrapper.append(this.onion_skin_canvas);
    this.canvas_wrapper.append(this.temp_canvas);
    this.canvas_wrapper.append(this.hover_canvas);
    this.canvas_wrapper.append(this.input_canvas);
  }

  set_listeners() {
    this.canvas_wrapper.addEventListener("contextmenu", this.contextmenu_bind);
  }

  contextmenu(event) {
    event.preventDefault();
  }

  disconnectedCallback() {
    this.canvas_wrapper.removeEventListener(
      "contextmenu",
      this.contextmenu_bind
    );
  }

  /**
   * Updates the size of all canvas objects
   */
  set_canvas_sizes(width, height) {
    [...this.canvas_array].forEach((canvas) => {
      canvas.revert_canvas();
      canvas.canvas.width = width;
      canvas.canvas.height = height;
    });
  }
}

customElements.define("sprite-canvas", SpriteCanvas);
