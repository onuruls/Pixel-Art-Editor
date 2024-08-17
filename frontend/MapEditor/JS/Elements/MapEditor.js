import { LayerManager } from "./LayerManager.js";
import { TileLayer } from "./CanvasElements/Layer/TileLayer.js";
import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { Pen } from "../Tools/Pen.js";
import { Eraser } from "../Tools/Eraser.js";
import { ZoomIn } from "../Tools/ZoomIn.js";
import { ZoomOut } from "../Tools/ZoomOut.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";

export class MapEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_tool = null;
    this.layer_manager = new LayerManager();
    this.width = 64;
    this.height = 64;
    this.initialized = false;
    this.selected_asset = null;
    this.action_buffer = [];
    this.image_cache = {};
    this.pixel_size = 1;
    this.scale = 1;
  }

  /**
   * From HTMLElement called when element is mounted
   */
  connectedCallback() {
    if (!this.initialized) {
      this.init();
    }
  }

  /**
   * Initializes the MapEditor with its Parts
   */
  init() {
    this.appendCSS();
    this.appendComponents();
    this.set_listeners();
    this.selected_tool = new Pen(this);
    this.initialized = true;
    this.add_layer();
    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Appends CSS to the MapEditor
   */
  appendCSS() {
    const css = document.createElement("link");
    css.setAttribute("href", "../MapEditor/CSS/Elements/MapEditor.css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    this.appendChild(css);
  }

  /**
   * Appends the necessary components to the MapEditor
   */
  appendComponents() {
    this.map_tools = new MapEditorTools(this);
    this.map_canvas = new MapEditorCanvas(this);
    this.map_selection_area = new MapEditorSelectionArea(this);
    this.append(this.map_tools, this.map_canvas, this.map_selection_area);
    this.canvas_wrapper = this.map_canvas.querySelector(".canvas-wrapper");
  }

  /**
   * Sets the necessary eventlisteners
   */
  set_listeners() {
    this.map_tools
      .querySelector(".toolbox")
      .addEventListener("click", (event) => {
        const clickedElement = event.target.closest(".tool-button");
        if (clickedElement) {
          const tool = clickedElement.dataset.tool;
          this.selected_tool.destroy();
          this.selected_tool = this.select_tool_from_string(tool);
        }
      });

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        this.revert_last_action();
      }
      if (event.ctrlKey && event.key === "y") {
        this.redo_last_action();
      }
    });

    this.canvas_wrapper.addEventListener("scroll", () => {
      this.canvas_wrapper.style.backgroundPosition = `${-this.canvas_wrapper
        .scrollLeft}px ${-this.canvas_wrapper.scrollTop}px`;
    });
  }

  get active_layer() {
    return this.layer_manager.get_active_layer();
  }

  /**
   * Getter for the layer canvases.
   * @returns {Array} The layer canvases.
   */
  get layer_canvases() {
    return this.map_canvas.layer_canvases;
  }

  /**
   * Getter for the index of the currently active layer.
   * @returns {number} The active layer index.
   */
  get active_layer_index() {
    return this.layer_manager.active_layer_index;
  }

  /**
   * Adds a new layer and its corresponding canvas
   */
  add_layer() {
    const new_layer = Array.from({ length: this.width }, () =>
      Array(this.height).fill("")
    );
    this.layer_manager.add_layer(new_layer);

    const layerCanvas = new TileLayer(this.map_canvas);
    this.map_canvas.add_layer_canvas(layerCanvas);

    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Removes a layer at the specified index
   * @param {number} index
   */
  remove_layer(index) {
    this.layer_manager.remove_layer(index);
    this.map_canvas.remove_layerCanvas(index);
    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Toggles the visibility of a layer
   * @param {number} index
   */
  toggle_layer_visibility(index) {
    this.layer_manager.toggle_layer_visibility(index);
    this.map_canvas.toggle_layer_visibility(
      index,
      this.layer_manager.is_layer_visible(index)
    );
    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Switches to the layer at the specified index
   * @param {number} index
   */
  switch_layer(index) {
    this.layer_manager.switch_layer(index);
    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Reverts the last action done (CTRL + Z)
   */
  revert_last_action() {
    this.layer_manager.revert_last_action((point) => {
      this.apply_undo(point);
    });
  }

  /**
   * Redoes the last reverted action on the active layer (CTRL + Y)
   */
  redo_last_action() {
    this.layer_manager.redo_last_action((point) => {
      this.apply_redo(point);
    });
  }

  /**
   * Function to apply an undo operation on the canvas.
   * @param {Object} point
   */
  apply_undo(point) {
    this.active_layer[point.x][point.y] = point.prev_asset;
    this.map_canvas.layer_canvases[this.active_layer_index].revert_undo(point);
  }

  /**
   * Function to apply a redo operation on the canvas.
   * @param {Object} point
   */
  apply_redo(point) {
    this.active_layer[point.x][point.y] = point.asset;
    this.map_canvas.layer_canvases[this.active_layer_index].revert_redo(point);
  }

  /**
   * Adjusts the zoom level and position
   * @param {Number} zoom_level
   * @param {Number} mouseX
   * @param {Number} mouseY
   */
  apply_zoom(zoom_level, mouseX, mouseY) {
    const current_mouseX =
      (mouseX + this.canvas_wrapper.scrollLeft) / this.scale;
    const current_mouseY =
      (mouseY + this.canvas_wrapper.scrollTop) / this.scale;

    this.scale = Math.min(Math.max(this.scale + zoom_level, 1.0), 2.0);

    const new_mouseX = (mouseX + this.canvas_wrapper.scrollLeft) / this.scale;
    const new_mouseY = (mouseY + this.canvas_wrapper.scrollTop) / this.scale;
    this.map_canvas.querySelectorAll("canvas").forEach((canvas) => {
      canvas.width = 640 * this.scale;
      canvas.height = 640 * this.scale;
    });

    this.canvas_wrapper.style.backgroundSize = `${10 * this.scale}px ${
      10 * this.scale
    }px`;
    this.canvas_wrapper.style.backgroundPosition = `${-this.canvas_wrapper
      .scrollLeft}px ${-this.canvas_wrapper.scrollTop}px`;

    const deltaX = (current_mouseX - new_mouseX) * this.scale;
    const deltaY = (current_mouseY - new_mouseY) * this.scale;

    this.canvas_wrapper.scrollLeft += deltaX;
    this.canvas_wrapper.scrollTop += deltaY;

    this.dispatchEvent(
      new CustomEvent("zoom_changed", {
        detail: {
          scale: this.scale,
          mouseX,
          mouseY,
          size: this.pixel_size * 10,
        },
      })
    );
  }

  /**
   * Applies the given action to a block of pixels defined by this.pixel_size
   * @param {Number} x
   * @param {Number} y
   * @param {Function} action
   */
  apply_to_pixel_block(x, y, action) {
    for (let i = 0; i < this.pixel_size; i++) {
      for (let j = 0; j < this.pixel_size; j++) {
        const xi = x + i;
        const yj = y + j;
        if (this.coordinates_in_bounds(xi, yj)) {
          action(xi, yj);
        }
      }
    }
  }

  /**
   * Starts gouping pen points for the action stack
   */
  start_action_buffer() {
    this.action_buffer = [];
  }

  /**
   * Ends grouping and pushes to stack
   */
  end_action_buffer() {
    const current_stack = this.layer_manager.layer_stacks.get(
      this.layer_manager.active_layer_index
    );
    if (current_stack) {
      current_stack.push(this.action_buffer);
    }
    this.action_buffer = [];
  }

  /**
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset)
        .then((img) => {
          this.apply_to_pixel_block(x, y, (xi, yj) => {
            const prev_asset = this.layer_manager.get_active_layer()[xi][yj];
            if (prev_asset === this.selected_asset) return;
            this.layer_manager.get_active_layer()[xi][yj] = this.selected_asset;
            this.action_buffer.push({
              x: xi,
              y: yj,
              layer: this.layer_manager.active_layer_index,
              prev_asset: prev_asset,
              asset: this.selected_asset,
            });
            this.map_canvas.layer_canvases[
              this.layer_manager.active_layer_index
            ].dispatchEvent(
              new CustomEvent("pen_matrix_changed", {
                detail: {
                  x: xi,
                  y: yj,
                  asset: img,
                },
              })
            );
          });
        })
        .catch((error) => {
          console.error("Error loading image:", error);
        });
    }
  }

  /**
   * Loads an image and caches it.
   * @param {String} src
   * @returns {Promise<Image>}
   */
  load_image(src) {
    return new Promise((resolve, reject) => {
      if (this.image_cache[src]) {
        resolve(this.image_cache[src]);
      } else {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.image_cache[src] = img;
          resolve(img);
        };
        img.onerror = reject;
      }
    });
  }

  /**
   * @param {Number} x
   * @param {Number} y
   */
  eraser_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_asset = this.layer_manager.get_active_layer()[xi][yj];
      if (prev_asset !== "") {
        this.layer_manager.get_active_layer()[xi][yj] = "";
        this.action_buffer.push({
          x: xi,
          y: yj,
          layer: this.layer_manager.active_layer_index,
          prev_asset: prev_asset,
          asset: "",
        });
        this.map_canvas.layer_canvases[
          this.layer_manager.active_layer_index
        ].dispatchEvent(
          new CustomEvent("eraser_matrix_changed", {
            detail: {
              x: xi,
              y: yj,
            },
          })
        );
      }
    });
  }

  /**
   * @param {Number} x
   * @param {Number} y
   */
  hover_canvas_matrix(x, y) {
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("hover_matrix_changed", {
        detail: {
          x: x,
          y: y,
          size: this.pixel_size * 10,
        },
      })
    );
  }

  /**
   * Removes the hover-effect, when mouse leaves the canvas
   */
  remove_hover() {
    this.dispatchEvent(new CustomEvent("remove_hover"));
  }

  /**
   * Gets the fitting tool, when click
   * @param {String} string
   */
  select_tool_from_string(string) {
    switch (string) {
      case "pen":
        return new Pen(this);
      case "eraser":
        return new Eraser(this);
      case "zoom-in":
        return new ZoomIn(this);
      case "zoom-out":
        return new ZoomOut(this);
      default:
        return new Pen(this);
    }
  }

  /**
   * Returns true if the x and y coordinate are in the canvas bounds
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  coordinates_in_bounds(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.layer_manager.get_active_layer().length &&
      y < this.layer_manager.get_active_layer()[0].length
    );
  }
}

customElements.define("map-editor", MapEditor);
