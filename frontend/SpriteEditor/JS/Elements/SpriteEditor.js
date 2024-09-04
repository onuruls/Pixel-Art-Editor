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
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      "../SpriteEditor/CSS/Elements/SpriteEditor.css"
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.import_input = document.createElement("input");
    this.import_input.setAttribute("type", "file");
    this.import_input.setAttribute("accept", "image/png");
    this.sprite_tools = new SpriteTools(this);
    this.sprite_canvas = new SpriteCanvas(this);
    this.sprite_preview = new SpritePreview(this);
    this.appendChild(this.sprite_tools);
    this.appendChild(this.sprite_canvas);
    this.appendChild(this.sprite_preview);
    this.set_listeners();
    this.selected_tool = new Pen(this);
    this.selected_color = this.hex_to_rgb_array(
      this.sprite_tools.querySelector("#color_input").value
    );
    this.secondary_color = this.hex_to_rgb_array(
      this.sprite_tools.querySelector("#secondary_color_input").value
    );
    this.initialized = true;
  }

  /**
   * Sets the necessary eventlisteners
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
        this.selected_color = this.hex_to_rgb_array(event.target.value);
      });
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        this.revert_last_action();
      }
      if (event.ctrlKey && event.key === "y") {
        this.redo_last_action();
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
   * @param {} event
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
   *
   * @param {Number} size
   */
  set_pixel_size(size) {
    this.pixel_size = size;
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
   *
   * @param {String} hex_string
   * @returns {Array<Numbers>}
   */
  hex_to_rgb_array(hex_string) {
    hex_string = hex_string.replace(/^#/, "");
    const big_int = parseInt(hex_string, 16);
    const r = (big_int >> 16) & 255;
    const g = (big_int >> 8) & 255;
    const b = big_int & 255;
    const a = 255;
    return [r, g, b, a];
  }
  /**
   * Turns rgb-array to hex string
   * @param {Array<Number>} color
   * @returns {String}
   */
  rgb_array_to_hex(color) {
    const r = color[0].toString(16).padStart(2, "0");
    const g = color[1].toString(16).padStart(2, "0");
    const b = color[2].toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
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
   * Starts gouping pen or eraser points for the action stack
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
   * Reverts the last action done (STRG + Z)
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
   * Redoing the last reverted action
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
   * clears the changed points
   */
  clear_changed_points() {
    this.previous_changed = { x: null, y: null };
    this.previous_changed_first_half = { x: null, y: null };
    this.previous_changed_second_half = { x: null, y: null };
  }

  /**
   * Determines the color to use for a given pixel based on the tool.
   * @param {Number} x
   * @param {Number} y
   * @param {String} tool
   * @returns {Array<Number>}
   */
  get_tool_color(x, y, tool) {
    switch (tool) {
      case "pen":
        return this.selected_color;
      case "eraser":
        return [0, 0, 0, 0];
      default:
        return this.selected_color;
    }
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
   * @param {String} tool
   * @param {String} event_name
   */
  update_line(points, tool, event_name) {
    const [last_point, current_point] = points.slice(-2);
    const line_points = this.calculate_line_points(
      last_point.x,
      last_point.y,
      current_point.x,
      current_point.y
    );

    line_points.forEach(({ x, y }) => {
      this.apply_to_pixel_block(x, y, (xi, yj) => {
        const color = this.get_tool_color(xi, yj, tool);
        const prev_color = this.canvas_matrix[xi][yj];

        if (!this.compare_colors(prev_color, color)) {
          this.update_point(xi, yj, prev_color, color, event_name);
        }
      });
    });
  }

  /**
   * Handles pen changes on the canvas matrix.
   * @param {number} x
   * @param {number} y
   */
  pen_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj];
      if (!this.compare_colors(prev_color, this.selected_color)) {
        this.update_point(
          xi,
          yj,
          prev_color,
          this.selected_color,
          "pen_matrix_changed"
        );
      }
    });

    if (this.valid_previous_point(this.previous_changed)) {
      this.update_line(
        [this.previous_changed, { x, y }],
        "pen",
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

    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj];
      if (!this.compare_colors(prev_color, erase_color)) {
        this.update_point(
          xi,
          yj,
          prev_color,
          erase_color,
          "eraser_matrix_changed"
        );
      }
    });

    if (this.valid_previous_point(this.previous_changed)) {
      this.update_line(
        [this.previous_changed, { x, y }],
        "eraser",
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
   */
  mirror_pen_change_matrix(x1, x2, y1, y2, switch_state) {
    if (switch_state) {
      this.clear_changed_points();
    }

    const color = this.selected_color;
    const points = [
      { x: x1, y: y1, prev: this.previous_changed_first_half },
      { x: x2, y: y2, prev: this.previous_changed_second_half },
    ];

    points.forEach(({ x, y, prev }) => {
      if (this.coordinates_in_bounds(x, y)) {
        this.apply_to_pixel_block(x, y, (xi, yj) => {
          const prev_color = this.canvas_matrix[xi]?.[yj];
          if (
            prev_color !== undefined &&
            !this.compare_colors(prev_color, color)
          ) {
            this.update_point(xi, yj, prev_color, color, "pen_matrix_changed");
          }
        });

        if (this.valid_previous_point(prev)) {
          this.update_line(
            [
              { x: prev.x, y: prev.y },
              { x, y },
            ],
            "pen",
            "pen_matrix_changed"
          );
        }
      }
    });

    this.previous_changed_first_half = { x: x1, y: y1 };
    this.previous_changed_second_half = { x: x2, y: y2 };
  }

  /**
   * Checks if the coordinates aren't out of bound
   */
  valid_previous_point(prev) {
    return (
      ![prev.x, prev.y].some((coord) => coord === null) &&
      this.coordinates_in_bounds(prev.x, prev.y)
    );
  }

  /**
   *
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
   *
   * @param {Number} x
   * @param {Number} y
   */
  fill_change_matrix(x, y) {
    this.start_action_buffer();
    const fill_pixels = this.recursive_fill_matrix(
      x,
      y,
      this.canvas_matrix[x][y]
    );
    this.fill_visited = {};
    fill_pixels.forEach((pixel) => {
      this.action_buffer.push({
        x: pixel.x,
        y: pixel.y,
        prev_color: this.canvas_matrix[pixel.x][pixel.y],
        color: this.selected_color,
      });
      this.canvas_matrix[pixel.x][pixel.y] = this.selected_color;
    });
    this.dispatchEvent(
      new CustomEvent("fill_matrix_changed", {
        detail: {
          color: this.selected_color,
          points: fill_pixels,
          size: this.pixel_size * 10,
        },
      })
    );
    this.end_action_buffer();
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Array}
   */
  recursive_fill_matrix(x, y, color) {
    if (
      this.fill_visited[`${x}_${y}`] === undefined &&
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      this.compare_colors(this.canvas_matrix[x][y], color)
    ) {
      const self = { x: x, y: y };
      this.fill_visited[`${x}_${y}`] = false;
      return [
        self,
        ...this.recursive_fill_matrix(x + 1, y, color),
        ...this.recursive_fill_matrix(x - 1, y, color),
        ...this.recursive_fill_matrix(x, y + 1, color),
        ...this.recursive_fill_matrix(x, y - 1, color),
      ];
    } else {
      return [];
    }
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  fill_same_color_matrix(x, y) {
    this.start_action_buffer();
    const color = this.canvas_matrix[x][y];
    const fill_pixels = [];
    for (var i = 0; i < this.height; i++) {
      for (var j = 0; j < this.width; j++) {
        if (this.compare_colors(this.canvas_matrix[i][j], color)) {
          this.action_buffer.push({
            x: i,
            y: j,
            prev_color: this.canvas_matrix[i][j],
            color: this.selected_color,
          });
          this.canvas_matrix[i][j] = this.selected_color;
          fill_pixels.push({ x: i, y: j });
        }
      }
    }
    this.dispatchEvent(
      new CustomEvent("fill_matrix_changed", {
        detail: {
          color: this.selected_color,
          points: fill_pixels,
        },
      })
    );
    this.end_action_buffer();
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
   * Calculates the linepoints include in the line with Bresenham
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>}>}
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
        prev_color: this.canvas_matrix[x][y],
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
   * Draws a shape to the matrix used for rectangles, circles and lines
   * @param {Array<{x: Number, y: Number, prev_color: Array<Number>}>} shape_points
   * @param {Boolean} final
   */
  draw_shape_matrix(shape_points, final = false) {
    if (final) {
      this.start_action_buffer();
      const expanded_shape_points = this.expand_shape_points(shape_points);
      expanded_shape_points.forEach((point) => {
        const prev_color = this.canvas_matrix[point.x][point.y];
        if (!this.compare_colors(prev_color, this.selected_color)) {
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
            points: this.expand_shape_points(shape_points),
            color: this.selected_color,
          },
        })
      );
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
   *  Draws a rectangle on the Canvas
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_rectangle_matrix(x1, y1, x2, y2, final = false) {
    const rectangle_points = this.calculate_rectangle_points(x1, y1, x2, y2);
    this.draw_shape_matrix(rectangle_points, final);
  }
  /**
   * Calculates the matrix points included in the rectangle
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>}>}
   */
  calculate_rectangle_points(x1, y1, x2, y2) {
    const points = [];
    const y_direction = y1 - y2 > 0 ? -1 : 1;
    const x_direction = x1 - x2 > 0 ? -1 : 1;
    for (let i = x1; x_direction > 0 ? i <= x2 : i >= x2; i += x_direction) {
      points.push({ x: i, y: y1, prev_color: this.canvas_matrix[i][y1] });
      points.push({ x: i, y: y2, prev_color: this.canvas_matrix[i][x2] });
    }
    for (
      let j = y1 + y_direction;
      y_direction > 0 ? j < y2 : j > y2;
      j += y_direction
    ) {
      points.push({ x: x1, y: j, prev_color: this.canvas_matrix[x1][j] });
      points.push({ x: x2, y: j, prev_color: this.canvas_matrix[x2][j] });
    }
    return points;
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
    const circle_points = this.calculate_circle_points(x1, y1, x2, y2);
    this.draw_shape_matrix(circle_points, final);
  }
  /**
   * Calculates the matrix points included in the circle
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>}>}
   */
  calculate_circle_points(x1, y1, x2, y2) {
    const points = [];
    const added_points = [];
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = Math.min(x1, x2) + radiusX;
    const centerY = Math.min(y1, y2) + radiusY;
    const step = 1 / Math.max(radiusX, radiusY);
    for (let a = 0; a < 2 * Math.PI; a += step) {
      const x = Math.round(centerX + radiusX * Math.cos(a));
      const y = Math.round(centerY + radiusY * Math.sin(a));
      const pointKey = `${x},${y}`;
      if (!added_points[pointKey]) {
        points.push({ x: x, y: y, prev_color: this.canvas_matrix[x][y] });
        added_points[pointKey] = true;
      }
    }
    return points;
  }
  /**
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
   * Clamps a number between a minimum and a maximum value
   * @param {Number} value
   * @param {Number} min
   * @param {Number} max
   * @returns {Number}
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  /**
   * Changes the brightness of the pixel
   * @param {Number} x
   * @param {Number} y
   * @param {Number} brightness
   */
  change_brightness_matrix(x, y, brightness, darken) {
    brightness = darken ? -brightness : brightness;
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj];
      if (prev_color[3] == 0) return;
      const new_color = [
        this.clamp(prev_color[0] + brightness, 0, 255),
        this.clamp(prev_color[1] + brightness, 0, 255),
        this.clamp(prev_color[2] + brightness, 0, 255),
        prev_color[3],
      ];
      this.canvas_matrix[xi][yj] = new_color;
      if (
        !this.action_buffer.some((action) => action.x === xi && action.y === yj)
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
    });
  }

  /**
   * Applies dithering effect to a block of pixels
   * @param {Number} x
   * @param {Number} y
   */
  dither_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const is_draw = this.draw_or_erase({ x: xi, y: yj }) === "draw";
      const prev_color = this.canvas_matrix[xi][yj];
      const new_color = is_draw ? this.selected_color : [0, 0, 0, 0];

      if (!this.compare_colors(prev_color, new_color)) {
        this.canvas_matrix[xi][yj] = new_color;
        this.action_buffer.push({
          x: xi,
          y: yj,
          prev_color: prev_color,
          color: new_color,
        });
        this.dispatchEvent(
          new CustomEvent(
            is_draw ? "pen_matrix_changed" : "eraser_matrix_changed",
            {
              detail: {
                x: xi,
                y: yj,
                color: new_color,
              },
            }
          )
        );
      }
    });
  }
  /**
   * Filters canvas. Puts pixels with a color into move_points.
   * Better performance than moving the whole canvas.
   * The Pixels are added to the action_buffer as well.
   */
  filter_move_points() {
    this.move_points = [];
    for (let i = 0; i < this.canvas_matrix.length; i++) {
      for (let j = 0; j < this.canvas_matrix[i].length; j++) {
        if (!this.compare_colors(this.canvas_matrix[i][j], [0, 0, 0, 0])) {
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
   * Moves the move_pixels.
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
   * Writes move-changes to canvas_matrix.
   * Final position points are added to action_buffer.
   * unshit not push, so [0,0,0,0] are drawn first, when reverting.
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
   * Sets the startposition for rectangle- and lasso-selection
   * @param {{x: Number, y: Number}} position
   */
  set_selection_start_point(position) {
    this.selection_start_point = position;
  }

  /**
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
          prev_color: this.canvas_matrix[i][j],
          selection_color: this.selection_color,
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
          selection_color: this.selection_color,
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
            selection_color: this.selection_color,
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
   *
   * Fills the selection area with selection color
   * @param {Array<{x: number, y: number}>} pointsInsidePath
   */
  fill_selection(pointsInsidePath) {
    pointsInsidePath.forEach((point) => {
      if (!this.is_point_already_selected(point)) {
        this.selected_points.push({
          x: point.x,
          y: point.y,
          selection_color: this.selection_color,
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
   * Checks if a point is already selected (already in selected_points)
   * @param {{x: Number, y: Number}} point
   * @returns {Boolean}
   */
  is_point_already_selected(point) {
    if (this.selected_points.length === 0) return false;
    return this.selected_points.some((p) => this.compare_points(p, point));
  }

  /**
   * Compares two points
   * @param {x: Number, y: Number} point1
   * @param {x: Number, y: Number} point2
   * @returns {Boolean}
   */

  compare_points(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  /**
   * Applies dithering effect to a block of pixels
   * @param {Number} x
   * @param {Number} y
   */
  draw_or_erase(position) {
    const is_x_odd = position.x % 2 !== 0;
    const is_y_odd = position.y % 2 !== 0;
    if ((is_x_odd && !is_y_odd) || (!is_x_odd && is_y_odd)) {
      return "draw";
    } else {
      return "erase";
    }
  }

  /**
   * Sets the startposition for the movement of the selected area
   * @param {{x: Number, y: Number}} position
   */
  set_selection_move_start_point(position) {
    this.selection_move_start_point = position;
  }

  /**
   * Moves the selected area
   * @param {{x: Number, y: Number}} position
   */
  move_selected_area(position) {
    const difference = this.calculate_move_difference(position);
    this.selected_points = this.selected_points.map((point) => {
      const x = point.x - difference.x;
      const y = point.y - difference.y;
      const prev_color = this.coordinates_in_bounds(x, y)
        ? this.canvas_matrix[x][y]
        : [0, 0, 0, 0];
      return {
        x: x,
        y: y,
        prev_color: prev_color,
        selection_color: point.selection_color,
        original_color: point.original_color
          ? point.original_color
          : [0, 0, 0, 0],
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
   * Selects all neighboring pixels with the same color
   * @param {Number} x
   * @param {Number} y
   */
  shape_selection(x, y) {
    const target_color = this.canvas_matrix[x][y];
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
        this.compare_colors(this.canvas_matrix[x][y], target_color)
      ) {
        visited[key] = true;
        this.selected_points.push({
          x,
          y,
          prev_color: this.canvas_matrix[x][y],
          selection_color: this.selection_color,
        });
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }

    this.dispatchEvent(
      new CustomEvent("shape_selection", {
        detail: {
          points: this.selected_points,
        },
      })
    );
    this.draw_shape_selection();
  }

  /**
   * Draws the selection area based on shape selection and sends event to the canvas
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
   * Copies all the colors to the selected_points
   */
  copy_selected_pixel() {
    this.selection_copied = true;
    this.selected_points = this.selected_points.map((point) => {
      const original_color = this.canvas_matrix[point.x][point.y];

      return {
        ...point,
        original_color: original_color,
        selection_color: this.is_transparent(original_color)
          ? this.selection_color
          : this.combine_colors(original_color, this.selection_color),
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
   * Copies all the colors to the selected_points and clears all selected_points
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
   * Inserts the selected_pixel on the new position
   */
  paste_selected_pixel() {
    this.start_action_buffer();
    this.selected_points.forEach((point) => {
      if (
        this.coordinates_in_bounds(point.x, point.y) &&
        !this.is_transparent(point.original_color)
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
   * Checks if the color is transparent
   * @param {Array<Number>} color
   * @returns {Boolean}
   */
  is_transparent(color) {
    return color[0] === 0 && color[1] === 0 && color[2] === 0 && color[3] === 0;
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
   * Returns true if two color-Arrays are the same
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   */
  compare_colors(color1, color2) {
    return JSON.stringify(color1) === JSON.stringify(color2);
  }

  /**
   * Gets the color from the canvas and puts it in the color input
   * @param {Number} x
   * @param {Number} y
   */
  pick_color(x, y) {
    const color = this.canvas_matrix[x][y];
    if (color[3] !== 0) {
      this.selected_color = color;
      const hex_color = this.rgb_array_to_hex(color);
      this.sprite_tools.querySelector("#color_input").value = hex_color;
    }
  }

  /**
   * Gets the fitting tool, when clicked
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
   * Combines two colors for the copied points
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   * @returns
   */
  combine_colors(color1, color2) {
    const r = Math.round((color1[0] + color2[0]) / 2);
    const g = Math.round((color1[1] + color2[1]) / 2);
    const b = Math.round((color1[2] + color2[2]) / 2);
    const a = Math.round((color1[3] + color2[3]) / 2);
    return [r, g, b, a];
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
      x < this.canvas_matrix.length &&
      y < this.canvas_matrix[0].length
    );
  }

  /**
   * Saves the sprite in a JSON
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
   * imports .sprite files into the editor
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
   * imports .png files into the editor
   * @param {File} file
   */
  import_from_png(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
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
   * used during the import of png or sprite files
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
        context.fillStyle = this.color_array_to_rbga(pixel);
        context.fillRect(j, i, 1, 1);
      })
    );
    link.href = canvas.toDataURL("image/png");
    link.download = "image.png";
    link.click();
  }

  /**
   * Converts an array entry into a color string
   * @param {Array<Number>} pixel
   * @returns {String}
   */
  color_array_to_rbga(pixel) {
    return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
  }

  /**
   * Called when Import is clicked in FileArea
   */
  import_clicked() {
    this.import_input.click();
  }

  /**
   * Turns an ImageData-Array into a two
   * dimensional Array
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
   * Creates a new Matrix for the new frame
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
   * Called by the ActionStack fires event
   * to update the frame thumbnail
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
}

customElements.define("sprite-editor", SpriteEditor);
