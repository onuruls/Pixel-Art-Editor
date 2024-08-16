import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { ActionStack } from "../../../MapEditor/JS/Classes/ActionStack.js";
import { Pen } from "../Tools/Pen.js";
import { Eraser } from "../Tools/Eraser.js";
import { ZoomIn } from "../Tools/ZoomIn.js";
import { ZoomOut } from "../Tools/ZoomOut.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";

export class MapEditor extends HTMLElement {
  /**
   * Creates an instance of MapEditor
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_tool = null;
    this.layers = [];
    this.active_layer_index = 0;
    this.layers_visibility = [];
    this.layer_stacks = [];
    this.width = 64;
    this.height = 64;
    this.initialized = false;
    this.selected_points = [];
    this.pixel_size = 1;
    this.selected_asset = null;
    this.layer_stacks = new Map();
    this.action_buffer = [];
    this.scale = 1;
    this.image_cache = {};
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    if (!this.initialized) {
      this.init();
    }
  }

  /**
   * Initializes the MapEditor with its components
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
   * Appends the CSS file to the MapEditor
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
   * Sets the necessary event listeners
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

  /**
   * Gets the currently active layer
   * @returns {Array} The active layer
   */
  get active_layer() {
    return this.layers[this.active_layer_index];
  }

  /**
   * Adds a new layer and its corresponding canvas
   */
  add_layer() {
    const new_layer = Array.from({ length: this.width }, () =>
      Array(this.height).fill("")
    );
    this.layers.push(new_layer);
    this.layers_visibility.push(true);

    const layerCanvas = new DrawingCanvas(this.map_canvas);
    this.map_canvas.addLayerCanvas(layerCanvas);

    this.layer_stacks.set(this.layers.length - 1, new ActionStack());

    if (this.layers.length === 1) {
      this.active_layer_index = 0;
    }

    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  remove_layer(index) {
    if (this.layers.length > 1) {
      this.layers.splice(index, 1);
      this.layers_visibility.splice(index, 1);
      this.map_canvas.removeLayerCanvas(index);
      this.active_layer_index = Math.max(0, this.active_layer_index - 1);
      this.layer_stacks.delete(index);
      this.dispatchEvent(new CustomEvent("layers-updated"));
    }
  }

  /**
   * Toggles the visibility of a layer
   * @param {number} index
   */
  toggle_layer_visibility(index) {
    if (index >= 0 && index < this.layers.length) {
      this.layers_visibility[index] = !this.layers_visibility[index];
      this.map_canvas.toggle_layer_visibility(
        index,
        this.layers_visibility[index]
      );
      this.dispatchEvent(new CustomEvent("layers-updated"));
    }
  }

  /**
   * Checks if a layer is visible
   * @param {number} index
   * @returns {boolean}
   */
  is_layer_visible(index) {
    return this.layers_visibility[index];
  }

  /**
   * Switches to the layer at the specified index
   * @param {number} index
   */
  switch_layer(index) {
    if (index >= 0 && index < this.layers.length) {
      this.active_layer_index = index;
      this.map_canvas.setActiveLayer(index);
      this.dispatchEvent(new CustomEvent("layers-updated"));
    } else {
      console.error("Invalid layer index:", index);
    }
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
   * Applies a given action to a block of pixels defined by this.pixel_size
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
   * Starts grouping pen points for the action stack
   */
  start_action_buffer() {
    this.action_buffer = [];
  }

  /**
   * Ends grouping and pushes the action buffer to the stack
   */
  end_action_buffer() {
    const current_stack = this.layer_stacks.get(this.active_layer_index);
    if (current_stack) {
      current_stack.push(this.action_buffer);
    }
    this.action_buffer = [];
  }

  /**
   * Reverts the last action (CTRL + Z)
   */
  revert_last_action() {
    const current_stack = this.layer_stacks.get(this.active_layer_index);

    if (current_stack && !current_stack.actions_is_empty()) {
      const points = current_stack.pop_last_action();
      points.forEach((point) => {
        this.active_layer[point.x][point.y] = point.prev_asset;
      });
      this.map_canvas.layer_canvases[this.active_layer_index].dispatchEvent(
        new CustomEvent("revert_undo", { detail: { points } })
      );
    }
  }

  /**
   * Redoes the last reverted action
   */
  redo_last_action() {
    const current_stack = this.layer_stacks.get(this.active_layer_index);

    if (current_stack && !current_stack.redo_is_empty()) {
      const points = current_stack.pop_last_redo();
      points.forEach((point) => {
        this.active_layer[point.x][point.y] = point.asset;
      });

      // Trigger redo event only on the specific layer canvas
      this.map_canvas.layer_canvases[this.active_layer_index].dispatchEvent(
        new CustomEvent("revert_redo", { detail: { points } })
      );
    }
  }

  /**
   * Handles changes to the matrix when using the pen tool
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset)
        .then((img) => {
          this.apply_to_pixel_block(x, y, (xi, yj) => {
            const prev_asset = this.active_layer[xi][yj];
            if (prev_asset === this.selected_asset) return;
            this.active_layer[xi][yj] = this.selected_asset;
            this.action_buffer.push({
              x: xi,
              y: yj,
              layer: this.active_layer_index,
              prev_asset: prev_asset,
              asset: this.selected_asset,
            });
            // Trigger event only on the active layer canvas
            this.map_canvas.layer_canvases[
              this.active_layer_index
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
   * Handles changes to the matrix when using the eraser tool
   * @param {Number} x
   * @param {Number} y
   */
  eraser_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_asset = this.active_layer[xi][yj];
      if (prev_asset !== "") {
        this.active_layer[xi][yj] = "";
        this.action_buffer.push({
          x: xi,
          y: yj,
          layer: this.active_layer_index,
          prev_asset: prev_asset,
          asset: "",
        });
        // Trigger event only on the active layer canvas
        this.map_canvas.layer_canvases[this.active_layer_index].dispatchEvent(
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
   * Handles hover events over the canvas
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
   * Removes the hover effect when the mouse leaves the canvas
   */
  remove_hover() {
    this.dispatchEvent(new CustomEvent("remove_hover"));
  }

  /**
   * Selects a tool based on the provided string identifier
   * @param {String} string
   * @returns {Pen|Eraser|ZoomIn|ZoomOut}
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
   * Checks if the given x and y coordinates are within the canvas bounds
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  coordinates_in_bounds(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.active_layer.length &&
      y < this.active_layer[0].length
    );
  }
}

customElements.define("map-editor", MapEditor);
