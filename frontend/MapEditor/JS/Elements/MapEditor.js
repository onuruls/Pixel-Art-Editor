import { LayerManager } from "./LayerManager.js";
import { DrawingCanvas } from "./CanvasElements/DrawingCanvas.js";
import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { Pen } from "../Tools/Pen.js";
import { Eraser } from "../Tools/Eraser.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { Stroke } from "../Tools/Stroke.js";
import { Bucket } from "../Tools/Bucket.js";
import { Rectangle } from "../Tools/Rectangle.js";
import { Circle } from "../Tools/Circle.js";
import { RectangleSelection } from "../Tools/RectangleSelection.js";
import { IrregularSelection } from "../Tools/IrregularSelection.js";
import { ShapeSelection } from "../Tools/ShapeSelection.js";

export class MapEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_tool = null;
    this.layer_manager = new LayerManager(this);
    this.width = 100;
    this.height = 100;
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
    this.fill_visited = {};
    this.selected_points = [];
    this.selection_start_point = { x: 0, y: 0 };
    this.selection_move_start_point = { x: 0, y: 0 };
    this.selection_copied = false;
    this.previous_changed = { x: null, y: null };
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
    this.canvas_wrapper = this.map_canvas.querySelector(".canvas-wrapper");
    this.map_selection_area = new MapEditorSelectionArea(this);
    this.append(this.map_tools, this.map_canvas, this.map_selection_area);
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

    this.canvas_wrapper.addEventListener("wheel", (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        this.mouse_wheel_used_on_canvas(event);
      }
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
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
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
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
  }

  /**
   * Switches to the layer at the specified index
   * @param {number} index
   */
  switch_layer(index) {
    this.layer_manager.switch_layer(index);
    this.dispatchEvent(new CustomEvent("layers-updated"));
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
  }

  /**
   * Reverts the last action done (CTRL + Z)
   */
  revert_last_action() {
    this.layer_manager.revert_last_action((point) => {
      this.apply_undo(point);
    });
    this.destroy_selection();
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
  }

  /**
   * Redoes the last reverted action on the active layer (CTRL + Y)
   */
  redo_last_action() {
    this.layer_manager.redo_last_action((point) => {
      this.apply_redo(point);
    });
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
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
   * @param {Boolean} zoom_up
   * @param {Number} mouseX
   * @param {Number} mouseY
   */
  apply_zoom(zoom_up, mouseX, mouseY) {
    const current_mouseX =
      (mouseX + this.canvas_wrapper.scrollLeft) / this.scale;
    const current_mouseY =
      (mouseY + this.canvas_wrapper.scrollTop) / this.scale;

    let new_scale;
    if (zoom_up) {
      new_scale = this.scale - 0.1;
    } else {
      new_scale = this.scale + 0.1;
    }
    if (new_scale >= 1 && new_scale <= 3) {
      this.scale = new_scale;
    } else {
      return;
    }

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
   * Sets the pixel size for drawing.
   * @param {Number} size
   */
  set_pixel_size(size) {
    this.pixel_size = size;
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
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
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
            if (prev_asset === this.selected_asset) {
              this.previous_changed = { x: x, y: y };
              return;
            }
            this.update_line(
              [this.previous_changed, { x, y }],
              this.selected_asset,
              "pen_matrix_changed"
            );
          });
          this.previous_changed = { x: x, y: y };
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
        this.update_line(
          [this.previous_changed, { x, y }],
          "",
          "eraser_matrix_changed"
        );
      }
      this.previous_changed = { x: x, y: y };
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
      case "stroke":
        return new Stroke(this);
      case "bucket":
        return new Bucket(this);
      case "rectangle":
        return new Rectangle(this);
      case "circle":
        return new Circle(this);
      case "rectangle_selection":
        return new RectangleSelection(this);
      case "irregular_selection":
        return new IrregularSelection(this);
      case "shape_selection":
        return new ShapeSelection(this);
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
   * DUPLICATE -- merge with SpriteEditor
   * @param {Number} x
   * @param {Number} y
   */
  fill_change_matrix(x, y) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset).then((img) => {
        this.start_action_buffer();
        const content = this.layer_manager.get_active_layer();
        const fill_pixels = this.recursive_fill_matrix(x, y, content[x][y]);
        this.fill_visited = {};
        fill_pixels.forEach((pixel) => {
          this.action_buffer.push({
            x: pixel.x,
            y: pixel.y,
            layer: this.layer_manager.active_layer_index,
            prev_asset: content[pixel.x][pixel.y],
            asset: this.selected_asset,
          });
          content[pixel.x][pixel.y] = this.selected_asset;
        });
        this.dispatchEvent(
          new CustomEvent("fill_matrix_changed", {
            detail: {
              asset: img,
              points: fill_pixels,
            },
          })
        );
        this.end_action_buffer();
      });
    }
  }

  /**
   * DUPLICATE -- merge with SpriteEditor
   * @param {Number} x
   * @param {Number} y
   * @returns {Array}
   */
  recursive_fill_matrix(x, y, sprite) {
    const content = this.layer_manager.get_active_layer();
    if (
      this.fill_visited[`${x}_${y}`] === undefined &&
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      content[x][y] === sprite
    ) {
      const self = { x: x, y: y };
      this.fill_visited[`${x}_${y}`] = false;
      return [
        self,
        ...this.recursive_fill_matrix(x + 1, y, sprite),
        ...this.recursive_fill_matrix(x - 1, y, sprite),
        ...this.recursive_fill_matrix(x, y + 1, sprite),
        ...this.recursive_fill_matrix(x, y - 1, sprite),
      ];
    } else {
      return [];
    }
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
   * Draws a shape to the matrix used for rectangles, circles, and lines
   * @param {Array<{x: Number, y: Number}>} shape_points
   * @param {Boolean} final
   */
  draw_shape_matrix(shape_points, final = false) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset).then((img) => {
        const expanded_shape_points = this.expand_shape_points(shape_points);
        if (final) {
          this.start_action_buffer();
          const content = this.layer_manager.get_active_layer();
          expanded_shape_points.forEach((point) => {
            const prev_asset = content[point.x][point.y];
            if (prev_asset !== this.selected_asset) {
              this.action_buffer.push({
                x: point.x,
                y: point.y,
                layer: this.layer_manager.active_layer_index,
                prev_asset: prev_asset,
                asset: this.selected_asset,
              });
              content[point.x][point.y] = this.selected_asset;
            }
          });
          this.dispatchEvent(
            new CustomEvent("draw_shape", {
              detail: {
                points: expanded_shape_points,
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
                points: expanded_shape_points,
                asset: img,
              },
            })
          );
        }
      });
    }
  }

  /**
   * Expands the given shape points according to the pixel size
   * @param {Array<{x: Number, y: Number}>} shape_points
   * @returns {Array<{x: Number, y: Number}>}
   */
  expand_shape_points(shape_points) {
    const expanded_points = [];
    shape_points.forEach((point) => {
      this.apply_to_pixel_block(point.x, point.y, (xi, yj) => {
        expanded_points.push({ x: xi, y: yj });
      });
    });
    return expanded_points;
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

  /**
   * Copies all the colors to the selected_points
   */
  copy_selected_pixel() {
    this.selection_copied = true;
    const content = this.layer_manager.get_active_layer();
    this.selected_points = this.selected_points.map((point) => {
      const original_asset = content[point.x][point.y];
      return {
        ...point,
        original_asset: original_asset,
      };
    });
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * Inserts the selected_pixel on the new position
   */
  paste_selected_pixel() {
    this.start_action_buffer();
    const content = this.layer_manager.get_active_layer();
    this.selected_points.forEach((point) => {
      if (this.coordinates_in_bounds(point.x, point.y)) {
        this.action_buffer.push({
          x: point.x,
          y: point.y,
          layer: this.layer_manager.active_layer_index,
          prev_asset: content[point.x][point.y],
          asset: point.original_asset,
        });
        content[point.x][point.y] = point.original_asset;
      }
    });
    this.end_action_buffer();
    this.dispatchEvent(
      new CustomEvent("paste_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * Copies all the colors to the selected_points and clears all selected_points
   */
  cut_selected_pixel() {
    this.copy_selected_pixel();
    this.start_action_buffer();
    const content = this.layer_manager.get_active_layer();
    const cut_points = this.selected_points.map((point) => {
      content[point.x][point.y] = "";
      return {
        x: point.x,
        y: point.y,
        layer: this.layer_manager.active_layer_index,
        prev_asset: content[point.x][point.y],
        asset: "",
      };
    });
    this.action_buffer.push(...cut_points);
    this.end_action_buffer();
    this.dispatchEvent(
      new CustomEvent("cut_selected_area", {
        detail: {
          points: cut_points,
        },
      })
    );
  }

  /**
   * Removes selection, when tool is destroyed
   */
  destroy_selection() {
    this.selection_copied = false;
    this.selected_points = [];
    this.dispatchEvent(new CustomEvent("remove_selection"));
  }

  /**
   * Sets the startposition for rectangle- and lasso-selection
   * @param {{x: Number, y: Number}} position
   */
  set_selection_start_point(position) {
    this.selection_start_point = position;
    this.selected_points = [];
  }

  /**
   * Sets the startposition for the movement of the selected area
   * @param {{x: Number, y: Number}} position
   */
  set_selection_move_start_point(position) {
    this.selection_move_start_point = position;
  }

  /**
   * DUPLICATE SpriteEditor
   * Draws the selection area (Rectangle) and sends event to the canvas
   * @param {{x: Number, y: Number}} position
   */
  draw_rectangle_selection(position) {
    this.selected_points = [];
    const y_direction = this.selection_start_point.y - position.y > 0 ? -1 : 1;
    const x_direction = this.selection_start_point.x - position.x > 0 ? -1 : 1;
    for (
      let i = this.selection_start_point.x;
      x_direction > 0 ? i <= position.x : i >= position.x;
      i += x_direction
    ) {
      for (
        let j = this.selection_start_point.y;
        y_direction > 0 ? j <= position.y : j >= position.y;
        j += y_direction
      ) {
        this.selected_points.push({
          x: i,
          y: j,
        });
      }
    }
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * DUPLICATE SpriteEditor
   * Draws the selection area (Lasso) and dispatches an event to the canvas.
   * @param {Array<{x: number, y: number}>} path
   */
  draw_lasso_selection(path) {
    this.selected_points = [];

    const { x: x1_start, y: y1_start } = this.selection_start_point;
    const { x: x2_end, y: y2_end } = path[path.length - 1];

    const linePoints = this.calculate_line_points(
      x1_start,
      y1_start,
      x2_end,
      y2_end
    );

    linePoints.forEach((point) => {
      if (!this.is_point_already_selected(point)) {
        this.selected_points.push({
          x: point.x,
          y: point.y,
        });
      }
    });

    for (let i = 0; i < path.length - 1; i++) {
      const { x: x1, y: y1 } = path[i];
      const { x: x2, y: y2 } = path[i + 1];
      const linePoints = this.calculate_line_points(x1, y1, x2, y2);

      linePoints.forEach((point) => {
        if (!this.is_point_already_selected(point)) {
          this.selected_points.push({
            x: point.x,
            y: point.y,
          });
        }
      });
    }

    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * DUPLICATE SpriteEditor
   * Fills the selection area with selection color
   * @param {Array<{x: number, y: number}>} pointsInsidePath
   */
  fill_selection(pointsInsidePath) {
    pointsInsidePath.forEach((point) => {
      if (!this.is_point_already_selected(point)) {
        this.selected_points.push({
          x: point.x,
          y: point.y,
        });
      }
    });
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * DUPLICATE SpriteEditor
   * Selects all neighboring pixels with the same color
   * @param {Number} x
   * @param {Number} y
   */
  shape_selection(x, y) {
    const content = this.layer_manager.get_active_layer();
    const target_asset = content[x][y];
    const queue = [{ x, y }];
    const visited = {};

    this.selected_points = [];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const key = `${x}_${y}`;

      if (
        !visited[key] &&
        x >= 0 &&
        x < this.width &&
        y >= 0 &&
        y < this.height &&
        target_asset === content[x][y]
      ) {
        visited[key] = true;
        this.selected_points.push({
          x,
          y,
        });
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * DUPLICATE SpriteEditor
   * Checks if a point is already selected (already in selected_points)
   * @param {{x: Number, y: Number}} point
   * @returns {Boolean}
   */
  is_point_already_selected(point) {
    if (this.selected_points.length === 0) return false;
    return this.selected_points.some((p) => this.compare_points(p, point));
  }

  /**
   * DUPLICATE SpriteEditor
   * Compares two points
   * @param {x: Number, y: Number} point1
   * @param {x: Number, y: Number} point2
   * @returns {Boolean}
   */
  compare_points(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  /**
   * DUPLICATE SpriteEditor
   * Calculates the difference between the move startpoint and current position
   * @param {{x: Number, y: Number}} position
   * @returns {{x: Number, y: Number}}
   */
  calculate_move_difference(position) {
    return {
      x: this.selection_move_start_point.x - position.x,
      y: this.selection_move_start_point.y - position.y,
    };
  }

  /**
   * DUPLICATE SpriteEditor
   * Moves the selected area
   * @param {{x: Number, y: Number}} position
   */
  move_selected_area(position) {
    const difference = this.calculate_move_difference(position);
    this.selected_points = this.selected_points.map((point) => {
      const x = point.x - difference.x;
      const y = point.y - difference.y;
      return {
        ...point,
        x: x,
        y: y,
      };
    });
    this.selection_move_start_point = position;
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   *
   * @param {Event} event
   */
  mouse_wheel_used_on_canvas(event) {
    const { x, y } = this.get_mouse_position(event);
    if (event.deltaY > 0) {
      this.apply_zoom(
        true,
        x * this.tile_size * this.scale,
        y * this.tile_size * this.scale
      );
    } else {
      this.apply_zoom(
        false,
        x * this.tile_size * this.scale,
        y * this.tile_size * this.scale
      );
    }
  }

  /**
   * DUPLICATE Tool
   * Calculates mouse position from event.
   * @param {Event} event
   * @returns {{x: Number, y: Number}}
   */
  get_mouse_position(event) {
    const activeLayerCanvas =
      this.map_canvas.layer_canvases[this.layer_manager.active_layer_index];
    const rect = activeLayerCanvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (this.tile_size * this.scale);
    const mouseY = (event.clientY - rect.top) / (this.tile_size * this.scale);
    const x = Math.floor(mouseX);
    const y = Math.floor(mouseY);
    return { x, y };
  }

  /**
   * DUPLICATE SpriteEditor
   * Updates a single point on the canvas.
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} prev_color
   * @param {Array<Number>} color
   * @param {String} event_name
   */
  update_point(x, y, prev_asset, asset, event_name) {
    const content = this.layer_manager.get_active_layer();
    content[x][y] = asset;
    this.action_buffer.push({
      x: x,
      y: y,
      layer: this.layer_manager.active_layer_index,
      prev_asset: prev_asset,
      asset: asset,
    });
    let detail = {};
    detail.x = x;
    detail.y = y;
    if (event_name === "pen_matrix_changed") {
      detail.asset = this.image_cache[asset];
    }
    this.dispatchEvent(
      new CustomEvent(event_name, {
        detail: detail,
      })
    );
  }

  /**
   * DUPLICATE SpriteEditor
   * Updates a line of points on the canvas.
   * @param {Array<{x: Number, y: Number}>} points
   * @param {Array<Number>} color
   * @param {String} event_name
   */
  update_line(points, asset, event_name) {
    const [last_point, current_point] = points.slice(-2);
    const content = this.layer_manager.get_active_layer();
    const line_points = this.calculate_line_points(
      last_point.x,
      last_point.y,
      current_point.x,
      current_point.y
    );

    line_points.forEach(({ x, y }) => {
      this.apply_to_pixel_block(x, y, (xi, yj) => {
        const prev_asset = content[xi][yj];
        if (prev_asset !== asset) {
          this.update_point(xi, yj, prev_asset, asset, event_name);
        }
      });
    });
  }

  /**
   * Scrolls the canvas container to the x,y position
   * Called when preview is clicked
   * @param {Number} x
   * @param {Number} y
   */
  scroll_to_location(x, y) {
    this.canvas_wrapper.scrollLeft = x;
    this.canvas_wrapper.scrollTop = y;
    this.canvas_wrapper.dispatchEvent(new Event("scroll"));
  }

  /**
   * Saves the File in the Backend
   */
  save_file() {}
}

customElements.define("map-editor", MapEditor);
