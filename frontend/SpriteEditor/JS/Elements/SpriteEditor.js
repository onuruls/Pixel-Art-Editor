import { SpritePreview } from "./SpritePreview.js";
import { SpriteCanvas } from "./SpriteCanvas.js";
import { SpriteTools } from "./SpriteTools.js";
import { Eraser } from "../Tools/Eraser.js";
import { Pen } from "../Tools/Pen.js";
import { MirrorPen } from "../Tools/MirrorPen.js";
import { Bucket } from "../Tools/Bucket.js";
import { SameColorBucket } from "../Tools/SameColorBucket.js";
import { Stroke } from "../Tools/Stroke.js";
import { ColorPicker } from "../Tools/ColorPicker.js";
import { ActionStack } from "../Classes/ActionStack.js";
import { Rectangle } from "../Tools/Rectangle.js";
import { Circle } from "../Tools/Circle.js";
import { Lighting } from "../Tools/Lighting.js";
import { Move } from "../Tools/Move.js";
import { RectangleSelection } from "../Tools/RectangleSelection.js";
import { IrregularSelection } from "../Tools/IrregularSelection.js";
import { ShapeSelection } from "../Tools/ShapeSelection.js";
import { Dithering } from "../Tools/Dithering.js";
import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { EditorUtil } from "../../../Util/EditorUtil.js";
import { ColorUtil } from "../../../Util/ColorUtil.js";

export class SpriteEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_tool = null;
    this.width = 64;
    this.height = 64;
    this.tile_size = 10;
    this.sprite_canvas_width = 0;
    this.sprite_canvas_height = 0;
    this.canvas_wrapper_width = 0;
    this.canvas_wrapper_height = 0;
    this.canvas_matrix = this.create_canvas_matrix();
    this.canvas_matrices = [this.canvas_matrix];
    this.fill_visited = {};
    this.action_stack = new ActionStack(this);
    this.action_stacks = [this.action_stack];
    this.action_buffer = [];
    this.previous_changed = { x: null, y: null };
    this.previous_changed_first_half = { x: null, y: null };
    this.previous_changed_second_half = { x: null, y: null };
    this.current_frame_index = 0;
    this.move_points = [];
    this.initialized = false;
    this.selected_points = [];
    this.selection_start_point = { x: 0, y: 0 };
    this.selection_move_start_point = { x: 0, y: 0 };
    this.selection_color = [196, 252, 250, 123];
    this.selection_copied = false;
    this.pixel_size = 1;
    this.palettes = [
      "#A4A5A6",
      "#A4A5A6",
      "#A4A5A6",
      "#A4A5A6",
      "#A4A5A6",
      "#A4A5A6",
    ];

    this.selected_color = ColorUtil.hex_to_rgb_array(
      this.sprite_tools?.querySelector("#color_input")?.value || "#000000"
    );
    this.secondary_color = ColorUtil.hex_to_rgb_array(
      this.sprite_tools?.querySelector("#secondary_color_input")?.value ||
        "#FFFFFF"
    );
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
   * Initializes the SpriteEditor with its Parts
   */
  init() {
    this.appendCSS();
    this.appendComponents();
    this.create_file_input();

    this.set_listeners();
    this.selected_tool = new Pen(this);
    this.selected_color = ColorUtil.hex_to_rgb_array(
      this.sprite_tools.querySelector("#color_input").value
    );
    this.secondary_color = ColorUtil.hex_to_rgb_array(
      this.sprite_tools.querySelector("#secondary_color_input").value
    );
    this.initialized = true;

    const size_obs = new ResizeObserver((entries) => {
      entries.forEach((e) => {
        this.sprite_canvas_width = e.contentRect.width;
        this.sprite_canvas_height = e.contentRect.height;
      });
      this.resize_canvas_wrapper();
      this.sprite_canvas.set_canvas_sizes(
        this.canvas_wrapper_width,
        this.canvas_wrapper_height
      );
      this.sprite_canvas.background_canvas.draw_background_grid();
      this.sprite_canvas.drawing_canvas.repaint_canvas();
    });
    size_obs.observe(this.sprite_canvas);
  }

  /**
   * Appends CSS to the SpriteEditor
   */
  appendCSS() {
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      "../SpriteEditor/CSS/Elements/SpriteEditor.css"
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
  }

  /**
   * Appends the necessary components to the SpriteEditor
   */
  appendComponents() {
    this.sprite_tools = new SpriteTools(this);
    this.sprite_canvas = new SpriteCanvas(this);
    this.sprite_preview = new SpritePreview(this);
    this.appendChild(this.sprite_tools);
    this.appendChild(this.sprite_canvas);
    this.appendChild(this.sprite_preview);
    this.canvas_wrapper = this.sprite_canvas.querySelector(".canvas-wrapper");
  }

  /**
   * Creates the file input for importing sprites
   */
  create_file_input() {
    this.import_input = document.createElement("input");
    this.import_input.setAttribute("type", "file");
    this.import_input.setAttribute("accept", "image/png");
  }

  /**
   * Called when SpriteCanvas is resized, resizes the wrapper
   */
  resize_canvas_wrapper() {
    const max_height = this.sprite_canvas_height - 40;
    const max_width = this.sprite_canvas_width - 40;
    const height_tile_size = max_height / this.height;
    const width_tile_size = max_width / this.width;
    this.tile_size = Math.min(height_tile_size, width_tile_size);

    this.tile_size = Math.floor(this.tile_size);

    this.canvas_wrapper_width = this.tile_size * this.width;
    this.canvas_wrapper_height = this.tile_size * this.height;
    this.canvas_wrapper.style.width = this.canvas_wrapper_width;
    this.canvas_wrapper.style.height = this.canvas_wrapper_height;
  }

  /**
   * Sets the necessary event listeners
   */
  set_listeners() {
    const toolbox = this.sprite_tools.querySelector(".toolbox");
    toolbox.addEventListener("click", (event) => {
      const clickedElement = event.target.closest(".tool-button");
      if (clickedElement) {
        const tool = clickedElement.dataset.tool;
        this.selected_tool.destroy();
        this.selected_tool = this.select_tool_from_string(tool);
      }
    });
    this.sprite_tools
      .querySelector("#color_input")
      .addEventListener("input", (event) => {
        this.selected_color = ColorUtil.hex_to_rgb_array(event.target.value);
      });
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "z":
            this.revert_last_action();
            break;
          case "y":
            this.redo_last_action();
            break;
        }
      } else if (event.key === "Delete" && this.selected_points.length > 0) {
        this.erase_selected_pixels();
      } else {
        this.handle_tool_shortcuts(event);
      }
    });
    this.import_input.addEventListener("change", (event) => {
      this.import_sprite(event);
    });
  }

  /**
   * Handles tool shortcuts
   * @param {Event} event
   */
  handle_tool_shortcuts(event) {
    const active_element = document.activeElement;
    const is_input_field =
      active_element.tagName === "INPUT" ||
      active_element.tagName === "TEXTAREA" ||
      active_element.isContentEditable;

    if (is_input_field) {
      return;
    }

    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
      return;
    }

    const key = event.key;
    const tool_shortcuts = {
      p: "pen",
      m: "mirror_pen",
      b: "bucket",
      c: "same_color",
      e: "eraser",
      s: "stroke",
      r: "rectangle",
      o: "circle",
      v: "move",
      l: "shape_selection",
      t: "rectangle_selection",
      i: "irregular_selection",
      h: "lighting",
      d: "dithering",
      k: "color_picker",
    };

    const tool = tool_shortcuts[key];
    if (tool) {
      this.remove_hover();
      const clicked_element = this.sprite_tools.querySelector(
        `[data-tool="${tool}"]`
      );
      if (clicked_element) {
        this.selected_tool.destroy();
        this.selected_tool = this.select_tool_from_string(tool);
        const tool_buttons = this.sprite_tools.querySelectorAll(".tool-button");
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        clicked_element.classList.add("active");
      }
    }
  }

  /**
   * Sets the pixel size
   * @param {Number} size
   */
  set_pixel_size(size) {
    this.pixel_size = size;
  }

  /**
   * Creates the pixel matrix
   * @returns {Array<Array<Array<Number>>>}
   */
  create_canvas_matrix() {
    const matrix = new Array(64);
    for (var i = 0; i < this.height; i++) {
      matrix[i] = new Array(64);

      for (var j = 0; j < this.width; j++) {
        matrix[i][j] = [0, 0, 0, 0];
      }
    }
    return matrix;
  }

  /**
   * Starts grouping pen or eraser points for the action stack
   */
  start_action_buffer() {
    this.action_buffer = [];
  }

  /**
   * Ends grouping and pushes to stack
   */
  end_action_buffer() {
    this.action_stack.push(this.action_buffer);
    this.clear_changed_points();
  }

  /**
   * Reverts the last action done (CTRL + Z)
   */
  revert_last_action() {
    if (!this.action_stack.actions_is_empty()) {
      const points = this.action_stack.pop_last_action();
      points.forEach((point) => {
        this.canvas_matrix[point.x][point.y] = point.prev_color;
      });
      this.dispatchEvent(
        new CustomEvent("revert_undo", {
          detail: {
            points: points,
          },
        })
      );
    }
    this.update_frame_thumbnail();
  }

  /**
   * Redoes the last reverted action
   */
  redo_last_action() {
    if (!this.action_stack.redo_is_empty()) {
      const points = this.action_stack.pop_last_redo();
      points.forEach((point) => {
        this.canvas_matrix[point.x][point.y] = point.color;
      });
      this.dispatchEvent(
        new CustomEvent("revert_redo", {
          detail: {
            points: points,
          },
        })
      );
    }
    this.update_frame_thumbnail();
  }

  /**
   * Clears the changed points
   */
  clear_changed_points() {
    this.previous_changed = { x: null, y: null };
    this.previous_changed_first_half = { x: null, y: null };
    this.previous_changed_second_half = { x: null, y: null };
  }

  /**
   * Updates a single point on the canvas.
   * @param {Number} x
   * @param {Number} y
   * @param {Array<Number>} prev_color
   * @param {Array<Number>} color
   * @param {String} event_name
   */
  update_point(x, y, prev_color, color, event_name) {
    this.canvas_matrix[x][y] = color;
    this.action_buffer.push({ x, y, prev_color, color });

    this.dispatchEvent(
      new CustomEvent(event_name, {
        detail: {
          x: x,
          y: y,
          color: color,
          prev_color: prev_color,
        },
      })
    );
  }

  /**
   * Updates a line of points on the canvas.
   * @param {Array<{x: Number, y: Number}>} points
   * @param {Array<Number>} color
   * @param {String} event_name
   */
  update_line(points, color, event_name) {
    const [last_point, current_point] = points.slice(-2);
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
        this.canvas_matrix,
        (xi, yj) => {
          const prev_color = this.canvas_matrix[xi][yj];
          if (!ColorUtil.compare_colors(prev_color, color)) {
            this.update_point(xi, yj, prev_color, color, event_name);
          }
        }
      );
    });
  }

  /**
   * Handles pen changes on the canvas matrix.
   * @param {number} x
   * @param {number} y
   * @param {number} mousekey
   */
  pen_change_matrix(x, y, mousekey) {
    let color = this.set_color_by_mousekey(mousekey);
    EditorUtil.apply_to_pixel_block(
      x,
      y,
      this.pixel_size,
      this.canvas_matrix,
      (xi, yj) => {
        const prev_color = this.canvas_matrix[xi][yj];
        if (!ColorUtil.compare_colors(prev_color, color)) {
          this.update_point(xi, yj, prev_color, color, "pen_matrix_changed");
        }
      }
    );

    if (this.valid_previous_point(this.previous_changed)) {
      this.update_line(
        [this.previous_changed, { x, y }],
        color,
        "pen_matrix_changed"
      );
    }

    this.previous_changed = { x, y };
  }

  /**
   * Handles eraser changes on the canvas matrix.
   * @param {number} x
   * @param {number} y
   */
  eraser_change_matrix(x, y) {
    const erase_color = [0, 0, 0, 0];

    EditorUtil.apply_to_pixel_block(
      x,
      y,
      this.pixel_size,
      this.canvas_matrix,
      (xi, yj) => {
        const prev_color = this.canvas_matrix[xi][yj];
        if (!ColorUtil.compare_colors(prev_color, erase_color)) {
          this.update_point(
            xi,
            yj,
            prev_color,
            erase_color,
            "eraser_matrix_changed"
          );
        }
      }
    );

    if (this.valid_previous_point(this.previous_changed)) {
      this.update_line(
        [this.previous_changed, { x, y }],
        erase_color,
        "eraser_matrix_changed"
      );
    }

    this.previous_changed = { x, y };
  }

  /**
   * Handles mirror pen changes on the canvas matrix.
   * @param {number} x1
   * @param {number} x2
   * @param {number} y1
   * @param {number} y2
   * @param {boolean} switch_state
   * @param {number} mousekey
   */
  mirror_pen_change_matrix(x1, x2, y1, y2, switch_state, mousekey) {
    if (switch_state) {
      this.clear_changed_points();
    }
    let color = this.set_color_by_mousekey(mousekey);
    const points = [
      { x: x1, y: y1, prev: this.previous_changed_first_half },
      { x: x2, y: y2, prev: this.previous_changed_second_half },
    ];

    points.forEach(({ x, y, prev }) => {
      if (EditorUtil.coordinates_in_bounds(x, y, this.canvas_matrix)) {
        EditorUtil.apply_to_pixel_block(
          x,
          y,
          this.pixel_size,
          this.canvas_matrix,
          (xi, yj) => {
            const prev_color = this.canvas_matrix[xi]?.[yj];
            if (
              prev_color !== undefined &&
              !ColorUtil.compare_colors(prev_color, color)
            ) {
              this.update_point(
                xi,
                yj,
                prev_color,
                color,
                "pen_matrix_changed"
              );
            }
          }
        );

        if (this.valid_previous_point(prev)) {
          this.update_line(
            [
              { x: prev.x, y: prev.y },
              { x, y },
            ],
            color,
            "pen_matrix_changed"
          );
        }
      }
    });

    this.previous_changed_first_half = { x: x1, y: y1 };
    this.previous_changed_second_half = { x: x2, y: y2 };
  }

  /**
   * Checks if the previous point is valid (not out of bounds)
   * @param {{x: Number, y: Number}} prev
   * @returns {Boolean}
   */
  valid_previous_point(prev) {
    return (
      ![prev.x, prev.y].some((coord) => coord === null) &&
      EditorUtil.coordinates_in_bounds(prev.x, prev.y, this.canvas_matrix)
    );
  }

  /**
   * Hovers over the canvas matrix
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
   * Removes the hover effect when mouse leaves the canvas
   */
  remove_hover() {
    this.dispatchEvent(new CustomEvent("remove_hover"));
  }

  /**
   * Fills the matrix with the selected color using a recursive approach
   * @param {Number} x
   * @param {Number} y
   * @param {Number} mousekey
   */
  fill_change_matrix(x, y, mousekey) {
    this.start_action_buffer();
    let color = this.set_color_by_mousekey(mousekey);
    this.fill_visited = {};
    const fill_pixels = EditorUtil.recursive_fill_matrix(
      x,
      y,
      this.canvas_matrix,
      this.canvas_matrix[x][y],
      this.fill_visited,
      ColorUtil.compare_colors
    );

    fill_pixels.forEach((pixel) => {
      this.action_buffer.push({
        x: pixel.x,
        y: pixel.y,
        prev_color: this.canvas_matrix[pixel.x][pixel.y],
        color: color,
      });
      this.canvas_matrix[pixel.x][pixel.y] = color;
    });
    this.dispatchEvent(
      new CustomEvent("fill_matrix_changed", {
        detail: {
          color: color,
          points: fill_pixels,
          size: this.pixel_size * this.tile_size,
        },
      })
    );

    this.end_action_buffer();
  }

  /**
   * Fills all pixels of the same color in the matrix
   * @param {Number} x
   * @param {Number} y
   * @param {Number} mousekey
   */
  fill_same_color_matrix(x, y, mousekey) {
    let color = this.set_color_by_mousekey(mousekey);
    this.start_action_buffer();
    const prev_color = this.canvas_matrix[x][y];
    const fill_pixels = [];
    for (var i = 0; i < this.height; i++) {
      for (var j = 0; j < this.width; j++) {
        if (ColorUtil.compare_colors(this.canvas_matrix[i][j], prev_color)) {
          this.action_buffer.push({
            x: i,
            y: j,
            prev_color: this.canvas_matrix[i][j],
            color: color,
          });
          this.canvas_matrix[i][j] = color;
          fill_pixels.push({ x: i, y: j });
        }
      }
    }
    this.dispatchEvent(
      new CustomEvent("fill_matrix_changed", {
        detail: {
          color: color,
          points: fill_pixels,
        },
      })
    );
    this.end_action_buffer();
  }

  /**
   * Draws a straight line on the canvas
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
   * Draws a shape on the canvas matrix
   * @param {Array<{x: Number, y: Number}>} shape_points
   * @param {Boolean} final
   */
  draw_shape_matrix(shape_points, final = false) {
    if (final) {
      this.start_action_buffer();
      const expanded_shape_points = EditorUtil.expand_shape_points(
        shape_points,
        this.pixel_size,
        this.canvas_matrix
      );
      expanded_shape_points.forEach((point) => {
        const prev_color = this.canvas_matrix[point.x][point.y];
        if (!ColorUtil.compare_colors(prev_color, this.selected_color)) {
          this.action_buffer.push({
            x: point.x,
            y: point.y,
            prev_color: prev_color,
            color: this.selected_color,
          });
          this.canvas_matrix[point.x][point.y] = this.selected_color;
        }
      });
      this.dispatchEvent(
        new CustomEvent("draw_shape", {
          detail: {
            points: expanded_shape_points,
            color: this.selected_color,
            final: final,
          },
        })
      );
      this.end_action_buffer();
    } else {
      this.dispatchEvent(
        new CustomEvent("draw_temp_shape", {
          detail: {
            points: EditorUtil.expand_shape_points(
              shape_points,
              this.pixel_size,
              this.canvas_matrix
            ),
            color: this.selected_color,
          },
        })
      );
    }
  }

  /**
   * Draws a rectangle on the canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_rectangle_matrix(x1, y1, x2, y2, final = false) {
    const rectangle_points = EditorUtil.calculate_rectangle_points(
      x1,
      y1,
      x2,
      y2
    );
    this.draw_shape_matrix(rectangle_points, final);
  }

  /**
   * Draws a circle on the canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_circle_matrix(x1, y1, x2, y2, final = false) {
    const circle_points = EditorUtil.calculate_circle_points(x1, y1, x2, y2);
    this.draw_shape_matrix(circle_points, final);
  }

  /**
   * Changes the brightness of the pixel
   * @param {Number} x
   * @param {Number} y
   * @param {Number} brightness
   * @param {Boolean} darken
   */
  change_brightness_matrix(x, y, brightness, darken) {
    brightness = darken ? -brightness : brightness;
    EditorUtil.apply_to_pixel_block(
      x,
      y,
      this.pixel_size,
      this.canvas_matrix,
      (xi, yj) => {
        const prev_color = this.canvas_matrix[xi][yj];
        if (prev_color[3] == 0) return;
        const new_color = ColorUtil.adjust_brightness_array(
          prev_color,
          brightness
        );
        this.canvas_matrix[xi][yj] = new_color;
        if (
          !this.action_buffer.some(
            (action) => action.x === xi && action.y === yj
          )
        ) {
          this.action_buffer.push({
            x: xi,
            y: yj,
            prev_color: prev_color,
            color: new_color,
          });
        }
        this.dispatchEvent(
          new CustomEvent("pen_matrix_changed", {
            detail: {
              x: xi,
              y: yj,
              color: new_color,
            },
          })
        );
      }
    );
  }

  /**
   * Applies dithering effect to a block of pixels
   * @param {Number} x
   * @param {Number} y
   * @param {Number} mousekey
   */
  dither_change_matrix(x, y, mousekey) {
    let color = this.set_color_by_mousekey(mousekey);
    EditorUtil.apply_to_pixel_block(
      x,
      y,
      this.pixel_size,
      this.canvas_matrix,
      (xi, yj) => {
        const is_draw = EditorUtil.draw_or_erase({ x: xi, y: yj }) === "draw";
        const prev_color = this.canvas_matrix[xi][yj];
        color = is_draw ? color : [0, 0, 0, 0];

        if (!ColorUtil.compare_colors(prev_color, color)) {
          this.canvas_matrix[xi][yj] = color;
          this.action_buffer.push({
            x: xi,
            y: yj,
            prev_color: prev_color,
            color: color,
          });
          this.dispatchEvent(
            new CustomEvent(
              is_draw ? "pen_matrix_changed" : "eraser_matrix_changed",
              {
                detail: {
                  x: xi,
                  y: yj,
                  color: color,
                },
              }
            )
          );
        }
      }
    );
  }

  /**
   * Filters canvas to get move points
   */
  filter_move_points() {
    this.move_points = [];
    for (let i = 0; i < this.canvas_matrix.length; i++) {
      for (let j = 0; j < this.canvas_matrix[i].length; j++) {
        if (!ColorUtil.compare_colors(this.canvas_matrix[i][j], [0, 0, 0, 0])) {
          this.move_points.push({
            x: i,
            y: j,
            color: this.canvas_matrix[i][j],
          });
          this.action_buffer.push({
            x: i,
            y: j,
            prev_color: this.canvas_matrix[i][j],
            color: [0, 0, 0, 0],
          });
        }
      }
    }
  }

  /**
   * Moves the move pixels
   * @param {Number} x_diff
   * @param {Number} y_diff
   */
  move_matrix(x_diff, y_diff) {
    this.dispatchEvent(
      new CustomEvent("move_canvas", {
        detail: {
          points: this.move_points,
          x_diff: x_diff,
          y_diff: y_diff,
        },
      })
    );
  }

  /**
   * Finishes the move operation
   * @param {Number} x_diff
   * @param {Number} y_diff
   */
  finish_move(x_diff, y_diff) {
    this.canvas_matrix = this.create_canvas_matrix();
    this.move_points.forEach((point) => {
      const new_x = point.x - x_diff;
      const new_y = point.y - y_diff;
      if (
        new_x >= 0 &&
        new_x < this.width &&
        new_y >= 0 &&
        new_y < this.height
      ) {
        this.canvas_matrix[new_x][new_y] = point.color;
        this.action_buffer.unshift({
          x: new_x,
          y: new_y,
          prev_color: [0, 0, 0, 0],
          color: point.color,
        });
      }
    });
  }

  /**
   * Sets the start position for selection
   * @param {{x: Number, y: Number}} position
   */
  set_selection_start_point(position) {
    EditorUtil.set_selection_start_point(this, position);
  }

  /**
   * Draws the rectangle selection area
   * @param {{x: Number, y: Number}} position
   */
  draw_rectangle_selection(position) {
    EditorUtil.draw_rectangle_selection(this, position);
  }

  /**
   * Draws the lasso selection area
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
   * Determines whether to draw or erase based on the position for dithering
   * @param {{x: Number, y: Number}} position
   * @returns {String} "draw" or "erase"
   */
  draw_or_erase(position) {
    return EditorUtil.draw_or_erase(position);
  }

  /**
   * Sets the start position for moving the selection
   * @param {{x: Number, y: Number}} position
   */
  set_selection_move_start_point(position) {
    EditorUtil.set_selection_move_start_point(this, position);
  }

  /**
   * Moves the selected area
   * @param {{x: Number, y: Number}} position
   */
  move_selected_area(position) {
    EditorUtil.move_selected_area(this, position);
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
   * Draws the shape selection area
   */
  draw_shape_selection() {
    this.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * Removes the selected pixels
   */
  erase_selected_pixels() {
    this.start_action_buffer();
    this.selected_points.forEach((point) => {
      const prev_color = this.canvas_matrix[point.x][point.y];
      this.canvas_matrix[point.x][point.y] = [0, 0, 0, 0];
      this.action_buffer.push({
        x: point.x,
        y: point.y,
        prev_color,
        color: [0, 0, 0, 0],
      });
    });
    this.end_action_buffer();
    this.dispatchEvent(
      new CustomEvent("erase_selected_pixels", {
        detail: {
          points: this.selected_points,
        },
      })
    );

    this.repaint_canvas();
  }

  /**
   * Copies all the colors to the selected_points
   */
  copy_selected_pixel() {
    this.selection_copied = true;
    this.selected_points = this.selected_points.map((point) => {
      const original_color = this.canvas_matrix[point.x][point.y];
      return {
        ...point,
        original_color: original_color,
        selection_color: ColorUtil.is_transparent(original_color)
          ? this.selection_color
          : ColorUtil.blend_colors(
              ColorUtil.rgba_array_to_string(original_color),
              ColorUtil.rgba_array_to_string(this.selection_color)
            ),
      };
    });
    this.dispatchEvent(
      new CustomEvent("selected_area_copied", {
        detail: {
          points: this.selected_points,
        },
      })
    );
  }

  /**
   * Copies and cuts the selected pixels
   */
  cut_selected_pixel() {
    this.copy_selected_pixel();
    const empty_color = [0, 0, 0, 0];
    const cut_points = this.selected_points.map((point) => {
      this.canvas_matrix[point.x][point.y] = empty_color;
      return {
        x: point.x,
        y: point.y,
        prev_color: this.canvas_matrix[point.x][point.y],
        color: empty_color,
      };
    });
    this.action_stack.push(cut_points);
    this.dispatchEvent(
      new CustomEvent("cut_selected_area", {
        detail: {
          points: cut_points,
        },
      })
    );
  }

  /**
   * Pastes the selected pixels
   */
  paste_selected_pixel() {
    this.start_action_buffer();
    this.selected_points.forEach((point) => {
      if (
        EditorUtil.coordinates_in_bounds(
          point.x,
          point.y,
          this.canvas_matrix
        ) &&
        !ColorUtil.is_transparent(point.original_color)
      ) {
        this.action_buffer.push({
          x: point.x,
          y: point.y,
          prev_color: this.canvas_matrix[point.x][point.y],
          color: point.original_color,
        });
        this.canvas_matrix[point.x][point.y] = point.original_color;
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
   * Destroys the selection
   */
  destroy_selection() {
    EditorUtil.destroy_selection(this);
  }

  /**
   * Picks a color from the canvas
   * @param {Number} x
   * @param {Number} y
   */
  pick_color(x, y) {
    const color = this.canvas_matrix[x][y];
    if (color[3] !== 0) {
      this.selected_color = color;
      const hex_color = ColorUtil.rgb_array_to_hex(color);
      this.sprite_tools.querySelector("#color_input").value = hex_color;
    }
  }

  /**
   * Gets the fitting tool when clicked
   * @param {String} string
   */
  select_tool_from_string(string) {
    switch (string) {
      case "pen":
        return new Pen(this);
      case "eraser":
        return new Eraser(this);
      case "mirror_pen":
        return new MirrorPen(this);
      case "bucket":
        return new Bucket(this);
      case "same_color":
        return new SameColorBucket(this);
      case "stroke":
        return new Stroke(this);
      case "color_picker":
        return new ColorPicker(this);
      case "rectangle":
        return new Rectangle(this);
      case "circle":
        return new Circle(this);
      case "lighting":
        return new Lighting(this);
      case "move":
        return new Move(this);
      case "rectangle_selection":
        return new RectangleSelection(this);
      case "irregular_selection":
        return new IrregularSelection(this);
      case "shape_selection":
        return new ShapeSelection(this);
      case "dithering":
        return new Dithering(this);
      default:
        return new Pen(this);
    }
  }

  /**
   * Saves the sprite in a JSON file
   */
  save_as_sprite_file() {
    const filename = "test.sprite";
    const jsonString = JSON.stringify(this.canvas_matrix);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const download_link = document.createElement("a");
    download_link.href = url;
    download_link.download = filename;
    this.appendChild(download_link);
    download_link.click();
    this.removeChild(download_link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports the selected sprite into the sprite editor
   * @param {Event} event
   */
  import_sprite(event) {
    const file = event.target.files[0];
    const name = file.name;
    const parts = name.split(".");
    const file_type = parts[parts.length - 1];
    if (file_type === "png" && file) {
      this.import_from_png(file);
    } else {
      this.import_from_sprite(file);
    }
  }

  /**
   * Imports .sprite files into the editor
   * @param {File} file
   */
  import_from_sprite(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const file_content = e.target.result;
      this.handle_loaded_matrix(JSON.parse(file_content));
    };
    reader.readAsText(file);
  }

  /**
   * Imports .png files into the editor
   * @param {File} file
   */
  import_from_png(file) {
    console.log(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target.result);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, 64, 64);
        const image_data = context.getImageData(0, 0, 64, 64).data;
        this.handle_loaded_matrix(this.image_data_to_matrix(image_data));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Swaps the loaded matrix with the current one
   * @param {Array<Array<Array<Number>>>} loaded_canvas
   */
  handle_loaded_matrix(loaded_canvas) {
    this.start_action_buffer();
    this.canvas_matrix.forEach((row, x) =>
      row.forEach((pixel, y) => {
        this.action_buffer.push({
          x: x,
          y: y,
          prev_color: pixel,
          color: loaded_canvas[x][y],
        });
      })
    );
    this.canvas_matrix = loaded_canvas;
    this.end_action_buffer();
    this.repaint_canvas();
  }

  /**
   * Exports the image as a PNG file
   */
  export_as_png() {
    const canvas = document.createElement("canvas");
    const link = document.createElement("a");
    const context = canvas.getContext("2d");
    canvas.height = this.height;
    canvas.width = this.width;
    this.canvas_matrix.forEach((row, i) =>
      row.forEach((pixel, j) => {
        context.fillStyle = ColorUtil.rgba_array_to_string(pixel);
        context.fillRect(j, i, 1, 1);
      })
    );
    link.href = canvas.toDataURL("image/png");
    link.download = "image.png";
    link.click();
  }

  /**
   * Saves the sprite file (TODO)
   */
  save_sprite_file() {
    // TODO
  }

  /**
   * Called when Import is clicked in FileArea
   */
  import_clicked() {
    this.import_input.click();
  }

  /**
   * Turns an ImageData array into a two-dimensional array
   * @param {Array<Number>} data
   * @returns {Array<Array<Array<Number>>>}
   */
  image_data_to_matrix(data) {
    const result = this.create_canvas_matrix();
    const segment_size = 4;
    const row_size = 64;
    data.forEach((color, index) => {
      const row = Math.floor(index / (row_size * segment_size));
      const col = Math.floor(
        (index % (row_size * segment_size)) / segment_size
      );
      const colorIndex = index % segment_size;
      result[row][col][colorIndex] = color;
    });
    return result;
  }

  /**
   * Creates a new matrix for the new frame
   */
  add_matrix() {
    this.canvas_matrices.push(this.create_canvas_matrix());
    this.action_stacks.push(new ActionStack(this));
  }

  /**
   * Removes the matrix of a frame
   * @param {Number} index
   */
  remove_matrix(index) {
    this.canvas_matrices.splice(index, 1);
    this.action_stacks.splice(index, 1);
  }

  /**
   * Copies the matrix of a frame
   * @param {Number} index
   */
  copy_matrix(index) {
    const matrix = this.canvas_matrices[index];
    const copied_matrix = matrix.map((row) => row.map((color) => [...color]));
    const action_stack = new ActionStack(this);
    this.canvas_matrices.splice(index + 1, 0, copied_matrix);
    this.action_stacks.splice(index + 1, 0, action_stack);
  }

  /**
   * Switches the active matrix
   * @param {Number} index
   */
  switch_active_matrix(index) {
    this.current_frame_index = index;
    this.canvas_matrix = this.canvas_matrices[index];
    this.action_stack = this.action_stacks[index];
    this.repaint_canvas();
  }

  /**
   * Dispatches repaint event for the whole canvas
   */
  repaint_canvas() {
    this.dispatchEvent(new CustomEvent("repaint_canvas"));
    this.update_frame_thumbnail();
  }

  /**
   * Called by the ActionStack to update the frame thumbnail
   */
  update_frame_thumbnail() {
    this.dispatchEvent(
      new CustomEvent("update_frame_thumbnail", {
        detail: {
          img_url: this.sprite_canvas.drawing_canvas.canvas.toDataURL(),
        },
      })
    );
  }

  /**
   * Updates the array positions after swapping frames
   * @param {Number} old_index
   * @param {Number} new_index
   */
  update_frame_arrays(old_index, new_index) {
    const [matrix] = this.canvas_matrices.splice(old_index, 1);
    this.canvas_matrices.splice(new_index, 0, matrix);
    const [action_stack] = this.action_stacks.splice(old_index, 1);
    this.action_stacks.splice(new_index, 0, action_stack);
  }

  /**
   * Sets the color based on the mouse key
   * @param {Number} key
   * @returns {Array<Number>}
   */
  set_color_by_mousekey(key) {
    let color = this.selected_color;
    if (key === 2) {
      color = this.secondary_color;
    }
    return color;
  }

  /**
   * Gets the content of the editor (required for shape_selection)
   * @returns {Array}
   */
  get_content() {
    return this.canvas_matrix;
  }
}

customElements.define("sprite-editor", SpriteEditor);
