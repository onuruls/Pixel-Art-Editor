import { MapEditorPart } from "./MapEditorPart.js";
import { MapEditor } from "./MapEditor.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";
import { TempCanvas } from "./CanvasElements/TempCanvas.js";
import { HoverCanvas } from "./CanvasElements/HoverCanvas.js";
import { InputCanvas } from "./CanvasElements/InputCanvas.js";

export class MapEditorCanvas extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
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

customElements.define("map-editor-canvas", MapEditorCanvas);
