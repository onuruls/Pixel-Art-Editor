import { MapEditorPart } from "./MapEditorPart.js";
import { TileLayer } from "./CanvasElements/Layer/TileLayer.js";
import { TempCanvas } from "./CanvasElements/TempCanvas.js";
import { HoverCanvas } from "./CanvasElements/HoverCanvas.js";
import { InputCanvas } from "./CanvasElements/InputCanvas.js";

export class MapEditorCanvas extends MapEditorPart {
  /**
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
   * @param {TileLayer} layer_canvas
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

    this.redraw_every_canvas();
    this.map_editor.layer_manager.active_layer_index = toIndex;
    this.map_editor.switch_layer(toIndex);
  }

  /**
   * Renders all layers onto their respective canvases
   */
  render_layers() {
    this.layer_canvases.forEach((layer_canvas, layer_index) => {
      const canvasElement = layer_canvas.canvas;
      const ctx = canvasElement.getContext("2d");
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      const layer = this.map_editor.layer_manager.layers[layer_index];
      const content = layer.content;

      content.forEach((row, x) => {
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

  /**
   * Redraws every layer canvas after rearranging layers
   */
  redraw_every_canvas() {
    const layers = this.map_editor.layer_manager.layers;
    this.layer_canvases.forEach((layer_wrapper, layer_index) => {
      const canvas = layer_wrapper.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const layer = layers[layer_index];
      const content = layer.content;

      content.forEach((row, x) => {
        row.forEach((asset, y) => {
          if (asset) {
            this.paint_single_pixel(x, y, asset, ctx);
          }
        });
      });
    });
  }

  /**
   * Paints a single pixel on the canvas
   * @param {number} x
   * @param {number} y
   * @param {string} asset
   * @param {CanvasRenderingContext2D} ctx
   */
  paint_single_pixel(x, y, asset, ctx) {
    const cachedImage = this.map_editor.image_cache[asset];
    const scale = this.map_editor.scale;
    const pixelSize = 10 * scale;

    if (cachedImage) {
      ctx.drawImage(
        cachedImage,
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      );
    } else {
      const img = new Image();
      img.src = asset;
      img.onload = () => {
        this.map_editor.image_cache[asset] = img;
        ctx.drawImage(img, x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      };
    }
  }
}

customElements.define("map-editor-canvas", MapEditorCanvas);
