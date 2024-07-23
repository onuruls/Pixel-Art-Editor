import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { SpriteEditor } from "./SpriteEditor.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";
import { TempCanvas } from "./CanvasElements/TempCanvas.js";
import { HoverCanvas } from "./CanvasElements/HoverCanvas.js";
import { InputCanvas } from "./CanvasElements/InputCanvas.js";

export class SpriteCanvas extends SpriteEditorPart {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    super(sprite_editor);
    this.shape_holder = [];
    this.selected_points_holder = [];
    this.drawing_canvas = new DrawingCanvas(this);
    this.temp_canvas = new TempCanvas(this);
    this.hover_canvas = new HoverCanvas(this);
    this.input_canvas = new InputCanvas(this);
    this.canvas_wrapper = null;
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
    this.canvas_wrapper.append(this.drawing_canvas);
    this.canvas_wrapper.append(this.temp_canvas);
    this.canvas_wrapper.append(this.hover_canvas);
    this.canvas_wrapper.append(this.input_canvas);
    this.drawing_canvas.canvas.addEventListener("resize", (event) => {
      this.drawing_canvas.canvas.height =
        event.target.getBoundingClientRect().height;
      this.drawing_canvas.canvas.width =
        event.target.getBoundingClientRect().width;
      this.dispatchEvent(
        new CustomEvent("canvas_resized", {
          detail: {
            height: event.target.getBoundingClientRect().height,
            width: event.target.getBoundingClientRect().width,
          },
        })
      );
    });
  }
}

customElements.define("sprite-canvas", SpriteCanvas);
