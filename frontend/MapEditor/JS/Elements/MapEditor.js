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
import { EditorUtil } from "../../../Util/EditorUtil.js";
import { File } from "../../../EditorTool/JS/Classes/File.js";
import { BackendClient } from "../../../BackendClient/BackendClient.js";

export class MapEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.map_file = null;
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
    this.tools_clicked_bind = this.tools_clicked.bind(this);
    this.keydown_handler_bind = this.keydown_handler.bind(this);
    this.mousewheel_handler_bind = this.mousewheel_handler.bind(this);
  }

  /**
   * Loads the map file and appends the editor to the
   * editor_container
   * @param {File} map_file
   * @param {HTMLDivElement} editor_container
   */
  load_map_editor(map_file, editor_container) {
    if (this.map_file && this.map_file.id === map_file.id) return;
    this.load_file_assets(map_file.data).then(() => {
      this.map_file = map_file;
      this.clear_editor(editor_container);
      this.load_file();
      this.map_canvas.redraw_every_layer();
      this.dispatchEvent(new CustomEvent("layers-updated"));
      // setTimeout(() => {
      this.dispatchEvent(new CustomEvent("reload_map_preview"));
      // }, 0);
    });
  }

  /**
   * From HTMLElement called when element is mounted
   */
  connectedCallback() {
    if (!this.initialized) {
      this.init();
    }
    this.set_listeners();
    this.map_canvas.input_canvas.set_tool_liseners();
  }

  /**
   * Initializes the MapEditor with its Parts
   */
  init() {
    this.appendCSS();
    this.appendComponents();
    this.set_listeners();
    this.selected_tool = new Pen(this);
    this.map_canvas.input_canvas.set_tool_liseners();
    this.initialized = true;
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

  disconnectedCallback() {
    this.map_tools
      .querySelector(".toolbox")
      .removeEventListener("click", this.tools_clicked_bind);
    document.removeEventListener("keydown", this.keydown_handler_bind);
    this.canvas_wrapper.removeEventListener(
      "wheel",
      this.mousewheel_handler_bind
    );
  }

  /**
   * Sets the necessary eventlisteners
   */
  set_listeners() {
    this.map_tools
      .querySelector(".toolbox")
      .addEventListener("click", this.tools_clicked_bind);
    document.addEventListener("keydown", this.keydown_handler_bind);
    this.canvas_wrapper.addEventListener("wheel", this.mousewheel_handler_bind);
  }

  /**
   * Called when toolbox is clicked
   * @param {Event} event
   */
  tools_clicked(event) {
    const clickedElement = event.target.closest(".tool-button");
    if (clickedElement) {
      const tool = clickedElement.dataset.tool;
      this.selected_tool.destroy();
      this.selected_tool = this.select_tool_from_string(tool);
      this.map_canvas.input_canvas.set_tool_liseners();
    }
  }

  /**
   * Handles the keydown events
   * @param {Event} event
   */
  keydown_handler(event) {
    if (event.ctrlKey && event.key === "z") {
      this.revert_last_action();
    }
    if (event.ctrlKey && event.key === "y") {
      this.redo_last_action();
    }
  }

  /**
   * Handles the mousewheel events
   * @param {Event} event
   */
  mousewheel_handler(event) {
    if (event.ctrlKey) {
      event.preventDefault();
      this.mouse_wheel_used_on_canvas(event);
    }
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
   * Loads a layer from the file
   * @param {Array<Array<String>>} layer
   */
  load_layer(layer) {
    const new_layer_index = this.layer_manager.load_layer(layer);
    const layer_canvas = new DrawingCanvas(this.map_canvas, new_layer_index);
    this.map_canvas.add_layer_canvas(layer_canvas);
    this.layer_manager.active_layer_index = new_layer_index;
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
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
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
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
  }

  /**
   * Switches to the layer at the specified index
   * @param {number} index
   */
  switch_layer(index) {
    this.layer_manager.switch_layer(index);
    this.dispatchEvent(new CustomEvent("layers-updated"));
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
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
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
  }

  /**
   * Redoes the last reverted action on the active layer (CTRL + Y)
   */
  redo_last_action() {
    this.layer_manager.redo_last_action((point) => {
      this.apply_redo(point);
    });
    this.dispatchEvent(new CustomEvent("reload_map_preview"));
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
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
    const result = EditorUtil.apply_zoom(
      zoom_up,
      this.scale,
      mouseX,
      mouseY,
      1,
      3
    );
    this.scale = result.new_scale;

    this.map_canvas.set_canvas_sizes(
      this.canvas_wrapper_width * this.scale,
      this.canvas_wrapper_height * this.scale
    );

    EditorUtil.scroll_canvas(this.canvas_wrapper, result.deltaX, result.deltaY);

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
   * Sets the pixel size for drawing.
   * @param {Number} size
   */
  set_pixel_size(size) {
    this.pixel_size = size;
  }

  /**
   * Starts grouping pen points for the action stack
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
    this.map_file.update_data(this.layer_manager.layers);
    BackendClient.save_map_file(this.map_file);
  }

  /**
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset)
        .then((img) => {
          EditorUtil.apply_to_pixel_block(
            x,
            y,
            this.pixel_size,
            this.layer_manager.get_active_layer(),
            (xi, yj) => {
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
            }
          );
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
   * Loading alle Assets at "once" when loading a file
   * @param {Array<String>} assets
   * @returns {Promise}
   */
  load_assets(assets) {
    const promises = assets.map((asset) => this.load_image(asset));
    return Promise.all(promises);
  }

  /**
   * Called when a file is loaded into the MapEditor
   * Loads all the assets
   * @param {JSON} file_data
   * @returns {Promise}
   */
  load_file_assets(file_data) {
    const assets = [];
    file_data.forEach((layer) =>
      layer.content.forEach((row) => row.forEach((col) => assets.push(col)))
    );
    const unique_assets = [...new Set(assets)];
    const filtered_assets = unique_assets.filter((asset) => asset !== "");
    if (filtered_assets.length === 0) return Promise.resolve();
    return this.load_assets(filtered_assets);
  }

  /**
   * @param {Number} x
   * @param {Number} y
   */
  eraser_change_matrix(x, y) {
    EditorUtil.apply_to_pixel_block(
      x,
      y,
      this.pixel_size,
      this.layer_manager.get_active_layer(),
      (xi, yj) => {
        const prev_asset = this.layer_manager.get_active_layer()[xi][yj];
        if (prev_asset !== "") {
          this.update_line(
            [this.previous_changed, { x, y }],
            "",
            "eraser_matrix_changed"
          );
        }
        this.previous_changed = { x: x, y: y };
      }
    );
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
   * @param {Number} x
   * @param {Number} y
   */
  fill_change_matrix(x, y) {
    if (this.selected_asset) {
      this.load_image(this.selected_asset).then((img) => {
        this.start_action_buffer();
        const content = this.layer_manager.get_active_layer();
        this.fill_visited = {};
        const fill_pixels = EditorUtil.recursive_fill_matrix(
          x,
          y,
          content,
          content[x][y],
          this.fill_visited,
          (a, b) => a === b
        );

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
   *  Draws a straight Line on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_line_matrix(x1, y1, x2, y2, final = false) {
    const line_points = EditorUtil.calculate_line_points(x1, y1, x2, y2);
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
    const rectangle_points = EditorUtil.calculate_rectangle_points(
      start_x,
      start_y,
      end_x,
      end_y
    );
    this.draw_shape_matrix(rectangle_points, final);
  }

  /**
   * Draws a circle on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_circle_matrix(x1, y1, x2, y2, final = false) {
    const active_layer = this.layer_manager.get_active_layer();
    const circle_points = EditorUtil.calculate_circle_points(x1, y1, x2, y2);
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
        const expanded_shape_points = EditorUtil.expand_shape_points(
          shape_points,
          this.pixel_size,
          this.layer_manager.get_active_layer()
        );
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
    return EditorUtil.expand_shape_points(
      shape_points,
      this.pixel_size,
      this.layer_manager.get_active_layer()
    );
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
      if (EditorUtil.coordinates_in_bounds(point.x, point.y, content)) {
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
    EditorUtil.destroy_selection(this);
  }

  /**
   * Sets the start position for rectangle- and lasso-selection
   * @param {{x: Number, y: Number}} position
   */
  set_selection_start_point(position) {
    EditorUtil.set_selection_start_point(this, position);
    this.selected_points = [];
  }

  /**
   * Sets the start position for the movement of the selected area
   * @param {{x: Number, y: Number}} position
   */
  set_selection_move_start_point(position) {
    EditorUtil.set_selection_move_start_point(this, position);
  }

  /**
   * Draws the selection area (Rectangle) and sends event to the canvas
   * @param {{x: Number, y: Number}} position
   */
  draw_rectangle_selection(position) {
    EditorUtil.draw_rectangle_selection(this, position);
  }

  /**
   * Draws the selection area (Lasso) and dispatches an event to the canvas.
   * @param {Array<{x: number, y: number}>} path
   */
  draw_lasso_selection(path) {
    EditorUtil.draw_lasso_selection(this, path);
  }

  /**
   * Fills the selection area with selection color
   * @param {Array<{x: number, y: number}>} pointsInsidePath
   */
  fill_selection(pointsInsidePath) {
    EditorUtil.fill_selection(this, pointsInsidePath);
  }

  /**
   * Selects all neighboring pixels with the same color
   * @param {Number} x
   * @param {Number} y
   */
  shape_selection(x, y) {
    EditorUtil.shape_selection(this, x, y);
  }

  /**
   * Compares two points
   * @param {x: Number, y: Number} point1
   * @param {x: Number, y: Number} point2
   * @returns {Boolean}
   */
  compare_points(point1, point2) {
    return EditorUtil.compare_points(point1, point2);
  }

  /**
   * Moves the selected area
   * @param {{x: Number, y: Number}} position
   */
  move_selected_area(position) {
    EditorUtil.move_selected_area(this, position);
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
   * Calculates mouse position from event.
   * @param {Event} event
   * @returns {{x: Number, y: Number}}
   */
  get_mouse_position(event) {
    return EditorUtil.get_mouse_position(
      event,
      this.tile_size,
      this.scale,
      this.map_canvas.layer_canvases[this.layer_manager.active_layer_index]
    );
  }

  /**
   * Updates a single point on the canvas.
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} prev_asset
   * @param {Array<Number>} asset
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
   * Updates a line of points on the canvas.
   * @param {Array<{x: Number, y: Number}>} points
   * @param {Array<Number>} asset
   * @param {String} event_name
   */
  update_line(points, asset, event_name) {
    const [last_point, current_point] = points.slice(-2);
    const content = this.layer_manager.get_active_layer();
    const line_points = EditorUtil.calculate_line_points(
      last_point.x,
      last_point.y,
      current_point.x,
      current_point.y
    );

    line_points.forEach(({ x, y }) => {
      EditorUtil.apply_to_pixel_block(
        x,
        y,
        this.pixel_size,
        this.layer_manager.get_active_layer(),
        (xi, yj) => {
          const prev_asset = content[xi][yj];
          if (prev_asset !== asset) {
            this.update_point(xi, yj, prev_asset, asset, event_name);
          }
        }
      );
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
   * Loads the data from the file, when the MapEditor is
   * opened
   */
  load_file() {
    if (this.map_file.data[0].content.length > 0) {
      this.map_file.data.forEach((layer) => this.load_layer(layer));
    } else {
      this.add_layer();
    }
  }

  /**
   *
   * @param {HTMLDivElement} editor_container
   */
  clear_editor(editor_container) {
    if (!this.isConnected) {
      while (editor_container.firstChild) {
        editor_container.removeChild(editor_container.firstChild);
      }
      editor_container.appendChild(this);
    }
    this.layer_manager.reset();
    this.map_canvas.reset();
  }
}

customElements.define("map-editor", MapEditor);
