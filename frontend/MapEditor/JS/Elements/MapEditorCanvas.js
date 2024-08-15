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

  init() {
    this.canvas_wrapper = this.querySelector(".canvas-wrapper");
    this.canvas_wrapper.append(
      this.drawing_canvas,
      this.temp_canvas,
      this.hover_canvas,
      this.input_canvas
    );
    this.drawing_canvas.canvas.addEventListener("resize", (event) => {
      const { height, width } = event.target.getBoundingClientRect();
      this.drawing_canvas.canvas.height = height;
      this.drawing_canvas.canvas.width = width;
      this.dispatchEvent(
        new CustomEvent("canvas_resized", { detail: { height, width } })
      );
    });
    this.canvas_wrapper.style.backgroundSize = `${
      10 * this.map_editor.scale
    }px ${10 * this.map_editor.scale}px`;
    this.canvas_wrapper.style.backgroundPosition = `0px 0px`;

    this.renderLayers();
  }

  renderLayers() {
    const ctx = this.drawing_canvas.canvas.getContext("2d");
    ctx.clearRect(
      0,
      0,
      this.drawing_canvas.canvas.width,
      this.drawing_canvas.canvas.height
    );

    this.map_editor.layers.forEach((layer) => {
      for (let x = 0; x < this.map_editor.width; x++) {
        for (let y = 0; y < this.map_editor.height; y++) {
          const asset = layer[x][y];
          if (asset) {
            const img = new Image();
            img.src = asset;
            img.onload = () => {
              ctx.drawImage(
                img,
                x * this.map_editor.pixel_size * 10,
                y * this.map_editor.pixel_size * 10,
                this.map_editor.pixel_size * 10,
                this.map_editor.pixel_size * 10
              );
            };
          }
        }
      }
    });
  }
}

customElements.define("map-editor-canvas", MapEditorCanvas);
