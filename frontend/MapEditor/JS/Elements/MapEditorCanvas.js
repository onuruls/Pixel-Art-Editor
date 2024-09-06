import { MapEditorPart } from "./MapEditorPart.js";
import { TempCanvas } from "./CanvasElements/TempCanvas.js";
import { HoverCanvas } from "./CanvasElements/HoverCanvas.js";
import { InputCanvas } from "./CanvasElements/InputCanvas.js";
import { BackgroundCanvas } from "./CanvasElements/BackgroundCanvas.js";

export class MapEditorCanvas extends MapEditorPart {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.background_canvas = new BackgroundCanvas(this);
    this.temp_canvas = new TempCanvas(this);
    this.hover_canvas = new HoverCanvas(this);
    this.input_canvas = new InputCanvas(this);
    this.layer_canvases = [];
    this.canvas_wrapper = null;
    this.canvas_array = [
      this.background_canvas,
      this.hover_canvas,
      this.temp_canvas,
      this.input_canvas,
    ];
  }

  /**
   * Returns the HTML string for the canvas wrapper
   * @returns {String}
   */
  render() {
    return `<div class="canvas-wrapper"></div>`;
  }

  /**
   * Initializes the MapEditorCanvas component
   */
  init() {
    this.canvas_wrapper = this.querySelector(".canvas-wrapper");
    this.canvas_wrapper.append(
      this.background_canvas,
      this.temp_canvas,
      this.hover_canvas,
      this.input_canvas
    );
    // this.update_background();
    this.background_canvas.draw_background_grid();
    // this.render_layers();
  }

  /**
   * Updates the size of all canvas objects
   */
  set_canvas_sizes(width, height) {
    [...this.canvas_array, ...this.layer_canvases].forEach((canvas) => {
      canvas.revert_canvas();
      canvas.canvas.width = width;
      canvas.canvas.height = height;
    });
    this.background_canvas.draw_background_grid();
  }

  /**
   * Updates the background grid size and position based on the current scale
   */
  update_background() {
    this.canvas_wrapper.style.backgroundSize = `${
      10 * this.map_editor.scale
    }px ${10 * this.map_editor.scale}px`;
    this.canvas_wrapper.style.backgroundPosition = `0px 0px`;
  }

  /**
   * Toggles the visibility of a specific layer
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
   * Rearranges the canvases when layers are reordered
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  rearrange_layer_canvases(fromIndex, toIndex) {
    const [movedCanvas] = this.layer_canvases.splice(fromIndex, 1);
    this.layer_canvases.splice(toIndex, 0, movedCanvas);

    this.layer_canvases.forEach((layer_canvas) => {
      this.canvas_wrapper.removeChild(layer_canvas);
    });

    this.layer_canvases.forEach((layer_canvas) => {
      this.canvas_wrapper.insertBefore(layer_canvas, this.temp_canvas);
    });

    this.redraw_every_layer();
    this.map_editor.layer_manager.active_layer_index = toIndex;
    this.map_editor.switch_layer(toIndex);
  }

  /**
   * Redraws every layer canvas after rearranging layers
   */
  redraw_every_layer() {
    this.layer_canvases.forEach((layer_canvas) => {
      if (layer_canvas.style.display !== "none") {
        layer_canvas.redraw_canvas();
      }
    });
  }
}

customElements.define("map-editor-canvas", MapEditorCanvas);
