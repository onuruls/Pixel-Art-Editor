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

    this.renderLayers();
  }

  /**
   * @param {number} index
   * @param {boolean} isVisible
   */
  toggle_layer_visibility(index, isVisible) {
    const layerCanvas = this.layer_canvases[index];
    if (layerCanvas) {
      layerCanvas.style.display = isVisible ? "block" : "none";
    }
  }

  /**
   * Adds a new layer canvas to the wrapper
   * @param {DrawingCanvas} layerCanvas
   */
  addLayerCanvas(layerCanvas) {
    this.layer_canvases.push(layerCanvas);
    this.canvas_wrapper.insertBefore(layerCanvas, this.temp_canvas);
  }

  /**
   * Removes the layer canvas at the specified index
   * @param {number} index
   */
  remove_layer_canvas(index) {
    const layerCanvas = this.layer_canvases[index];
    if (layerCanvas) {
      this.canvas_wrapper.removeChild(layerCanvas);
      this.layer_canvases.splice(index, 1);
    }
  }

  /**
   * Renders all layers onto their respective canvases
   */
  renderLayers() {
    this.layer_canvases.forEach((layerCanvas) => {
      layerCanvas.clearCanvas();
    });

    this.map_editor.layers.forEach((layer, layerIndex) => {
      const ctx = this.layer_canvases[layerIndex].getContext("2d");
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
