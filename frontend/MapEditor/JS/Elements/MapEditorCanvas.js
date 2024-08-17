import { MapEditorPart } from "./MapEditorPart.js";
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
    this.layer_canvases = [];
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
      this.temp_canvas,
      this.hover_canvas,
      this.input_canvas
    );
    this.canvas_wrapper.style.backgroundSize = `${
      10 * this.map_editor.scale
    }px ${10 * this.map_editor.scale}px`;
    this.canvas_wrapper.style.backgroundPosition = `0px 0px`;

    this.render_layers();
  }

  /**
   * @param {number} index
   * @param {boolean} isVisible
   */
  toggle_layer_visibility(index, isVisible) {
    const layer_canvas = this.layer_canvases[index];
    if (layer_canvas) {
      layer_canvas.style.display = isVisible ? "block" : "none";
    }
  }

  /**
   * Adds a new layer canvas to the wrapper
   * @param {DrawingCanvas} layer_canvas
   */
  add_layer_canvas(layer_canvas) {
    this.layer_canvases.push(layer_canvas);
    this.canvas_wrapper.insertBefore(layer_canvas, this.temp_canvas);
  }

  /**
   * Removes the layer canvas at the specified index
   * @param {number} index
   */
  remove_layer_canvas(index) {
    const layer_canvas = this.layer_canvases[index];
    if (layer_canvas) {
      this.canvas_wrapper.removeChild(layer_canvas);
      this.layer_canvases.splice(index, 1);
    }
  }

  /**
   * Renders all layers onto their respective canvases
   */
  render_layers() {
    this.layer_canvases.forEach((layer_canvas) => {
      layer_canvas.clearCanvas();
    });

    this.map_editor.layer_manager.layers.forEach((layer, layer_index) => {
      const ctx = this.layer_canvases[layer_index].getContext("2d");
      layer.forEach((row, x) => {
        row.forEach((asset, y) => {
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
        });
      });
    });
  }
}

customElements.define("map-editor-canvas", MapEditorCanvas);
