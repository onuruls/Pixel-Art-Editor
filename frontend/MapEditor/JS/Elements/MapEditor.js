import { LayerManager } from "./LayerManager.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";
import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { Pen } from "../Tools/Pen.js";
import { Eraser } from "../Tools/Eraser.js";
import { ZoomIn } from "../Tools/ZoomIn.js";
import { ZoomOut } from "../Tools/ZoomOut.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { Stroke } from "../Tools/Stroke.js";
import { Rectangle } from "../Tools/Rectangle.js";
import { Circle } from "../Tools/Circle.js";

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
    this.width = 24;
    this.height = 24;
    this.map_canvas_width = 0;
    this.map_canvas_height = 0;
    this.canvas_wrapper_width = 0;
    this.canvas_wrapper_height = 0;
    this.initialized = false;
    this.selected_asset = null;
    this.action_buffer = [];
    this.image_cache = {};
    this.pixel_size = 1;
    this.scale = 1;
    this.tile_size = 10;
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
    const size_obs = new ResizeObserver((entries) => {
      entries.forEach((e) => {
        this.map_canvas_width = e.contentRect.width;
        this.map_canvas_height = e.contentRect.height;
      });
      this.resize_canvas_wrapper();
      this.map_canvas.set_canvas_sizes(
        this.canvas_wrapper_width,
        this.canvas_wrapper_height
      );
      this.map_canvas.background_canvas.draw_background_grid();
      this.layer_manager;
    });
    size_obs.observe(this.map_canvas);
  }

  /**
   * Called when MapEditorCanvas is resized, resizes the wrapper
   */
  resize_canvas_wrapper() {
    const max_height = this.map_canvas_height - 40;
    const max_width = this.map_canvas_width - 40;
    const height_tile_size = max_height / this.height;
    const width_tile_size = max_width / this.width;
    this.tile_size = Math.min(height_tile_size, width_tile_size);

    this.canvas_wrapper_width = this.tile_size * this.width;
    this.canvas_wrapper_height = this.tile_size * this.height;
    this.canvas_wrapper.style.width = this.canvas_wrapper_width;
    this.canvas_wrapper.style.height = this.canvas_wrapper_height;
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

  /**
   * Returns the active layer
   * @returns {Array}
   */
  get_active_layer() {
    return this.layer_manager.get_active_layer();
  }

  /**
   * Getter for the layer canvases.
   * @returns {Array}
   */
  get_layer_canvases() {
    return this.map_canvas.layer_canvases;
  }

  /**
   * Adds a new layer and its corresponding canvas
   */
  add_layer() {
    const new_layer = Array.from({ length: this.width }, () =>
      Array(this.height).fill("")
    );
    const new_layer_index = this.layer_manager.add_layer(new_layer);

    const layerCanvas = new DrawingCanvas(this.map_canvas, new_layer_index);
    this.map_canvas.add_layer_canvas(layerCanvas);
    this.layer_manager.active_layer_index = new_layer_index;
    this.dispatchEvent(new CustomEvent("layers-updated"));
  }

  /**
   * Removes a layer at the specified index
   * @param {number} index
   */
  remove_layer(index) {
    this.layer_manager.remove_layer(index);
    this.map_canvas.remove_layer_canvas(index);
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
    this.layer_manager.get_active_layer()[point.x][point.y] = point.prev_asset;
    this.map_canvas.layer_canvases[
      this.layer_manager.active_layer_index
    ].revert_undo(point);
  }

  /**
   * Function to apply a redo operation on the canvas.
   * @param {Object} point
   */
  apply_redo(point) {
    this.layer_manager.get_active_layer()[point.x][point.y] = point.asset;
    this.map_canvas.layer_canvases[
      this.layer_manager.active_layer_index
    ].revert_redo(point);
  }

  /**
   * Adjusts the zoom level and location
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

    this.map_canvas.set_canvas_sizes(
      this.canvas_wrapper_width * this.scale,
      this.canvas_wrapper_height * this.scale
    );

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
          size: this.pixel_size * this.tile_size,
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
          size: this.pixel_size * this.tile_size,
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
      case "stroke":
        return new Stroke(this);
      case "rectangle":
        return new Rectangle(this);
      case "circle":
        return new Circle(this);
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

  /**
   *  Draws a straight Line on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_line_matrix(x1, y1, x2, y2, final = false) {
    const line_points = this.calculate_line_points(x1, y1, x2, y2);
    this.draw_shape_matrix(line_points, final);
  }

  /**
   *  Draws a rectangle on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_rectangle_matrix(end_x, end_y, start_x, start_y, final = false) {
    const rectangle_points = this.calculate_rectangle_points(
      start_x,
      start_y,
      end_x,
      end_y
    );
    this.draw_shape_matrix(rectangle_points, final);
  }

  /**
   * DUPLICATE -- merge with SpriteEditor
   * Draws a circle on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_circle_matrix(x1, y1, x2, y2, final = false) {
    const circle_points = this.calculate_circle_points(x1, y1, x2, y2);
    this.draw_shape_matrix(circle_points, final);
  }

  /**
   *  Draws a straight Line on the Canvas
   * @param {Array<{x: Number, y: Number, prev_asset: Array<Number>}>} shape_points
   * @param {Boolean} final
   */
  draw_shape_matrix(shape_points, final) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset).then((img) => {
        if (final) {
          this.start_action_buffer();
          const content = this.layer_manager.get_active_layer();
          shape_points.forEach((point) => {
            const prev_asset = content[point.x][point.y];
            this.action_buffer.push({
              x: point.x,
              y: point.y,
              layer: this.layer_manager.active_layer_index,
              prev_asset: prev_asset,
              asset: this.selected_asset,
            });
            content[point.x][point.y] = this.selected_asset;
          });
          this.dispatchEvent(
            new CustomEvent("draw_shape", {
              detail: {
                points: shape_points,
                asset: img,
              },
            })
          );
          this.end_action_buffer();
          this.map_canvas.temp_canvas.revert_canvas();
        } else {
          this.dispatchEvent(
            new CustomEvent("draw_temp_shape", {
              detail: {
                points: shape_points,
                asset: img,
              },
            })
          );
        }
      });
    }
  }

  /**
   * DUPLICATE -- merge with SpriteEditor
   * Calculates the linepoints include in the line with Bresenham
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_asset: Array<Number>}>}
   */
  calculate_line_points(x1, y1, x2, y2) {
    const line_points = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const step_x = x1 < x2 ? 1 : -1;
    const step_y = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    while (true) {
      line_points.push({
        x: x,
        y: y,
        prev_asset: this.layer_manager.get_active_layer()[x][y],
      });

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += step_x;
      }
      if (e2 < dx) {
        err += dx;
        y += step_y;
      }
    }
    return line_points;
  }

  /**
   * DUPLICATE -- merge with SpriteEditor
   * Calculates the matrix points included in the rectangle
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_asset: Array<Number>}>}
   */
  calculate_rectangle_points(x1, y1, x2, y2) {
    const points = [];
    const y_direction = y1 - y2 > 0 ? -1 : 1;
    const x_direction = x1 - x2 > 0 ? -1 : 1;
    const layer_matrix = this.layer_manager.get_active_layer();
    for (let i = x1; x_direction > 0 ? i <= x2 : i >= x2; i += x_direction) {
      points.push({ x: i, y: y1, prev_asset: layer_matrix[i][y1] });
      points.push({ x: i, y: y2, prev_asset: layer_matrix[i][x2] });
    }
    for (
      let j = y1 + y_direction;
      y_direction > 0 ? j < y2 : j > y2;
      j += y_direction
    ) {
      points.push({ x: x1, y: j, prev_asset: layer_matrix[x1][j] });
      points.push({ x: x2, y: j, prev_asset: layer_matrix[x2][j] });
    }
    return points;
  }

  /**
   * DUPLICATE -- merge with SpriteEditor
   * Calculates the matrix points included in the circle
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_asset: Array<Number>}>}
   */
  calculate_circle_points(x1, y1, x2, y2) {
    const points = [];
    const added_points = [];
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = Math.min(x1, x2) + radiusX;
    const centerY = Math.min(y1, y2) + radiusY;
    const step = 1 / Math.max(radiusX, radiusY);
    const content = this.layer_manager.get_active_layer();
    for (let a = 0; a < 2 * Math.PI; a += step) {
      const x = Math.round(centerX + radiusX * Math.cos(a));
      const y = Math.round(centerY + radiusY * Math.sin(a));
      const pointKey = `${x},${y}`;
      if (!added_points[pointKey]) {
        points.push({ x: x, y: y, prev_asset: content[x][y] });
        added_points[pointKey] = true;
      }
    }
    return points;
  }

  /**
   * DUPLICATE -- merge later with SpriteEditor
   * Adjusts the aspect ratio of a shape to maintain a 1:1 ratio if the Shift key is held.
   * @param {number} start_x
   * @param {number} start_y
   * @param {number} end_x
   * @param {number} end_y
   * @param {boolean} shiftKey
   * @returns {{ end_x: number, end_y: number }}
   */

  calculate_aspect_ratio(start_x, start_y, end_x, end_y, shiftKey) {
    if (shiftKey) {
      const width = Math.abs(end_x - start_x);
      const height = Math.abs(end_y - start_y);
      const size = Math.min(width, height);

      if (end_x < start_x) {
        end_x = start_x - size;
      } else {
        end_x = start_x + size;
      }

      if (end_y < start_y) {
        end_y = start_y - size;
      } else {
        end_y = start_y + size;
      }
    }
    return { end_x, end_y };
  }
}

customElements.define("map-editor", MapEditor);
