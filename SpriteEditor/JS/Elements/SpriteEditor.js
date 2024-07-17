import { SpritePreview } from "./SpritePreview.js";
import { SpriteCanvas } from "./SpriteCanvas.js";
import { SpriteTools } from "./SpriteTools.js";
import { Erazer } from "../Tools/Erazer.js";
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

export class SpriteEditor extends HTMLElement {
  constructor() {
    super();
    this.selected_tool = null;
    this.canvas_matrix = [];
    this.width = 64;
    this.height = 64;
    this.fill_visited = {};
    this.action_stack = new ActionStack();
    this.action_buffer = [];
    this.changed_points = [];
    this.move_points = [];
    this.selected_points = [];
    this.selection_start_point = { x: 0, y: 0 };
    this.selection_move_start_point = { x: 0, y: 0 };
    this.selection_color = [196, 252, 250, 123];
    this.selection_copied = false;
    this.pixel_size = 1;
  }

  connectedCallback() {
    this.css = document.createElement("link");
    this.css.setAttribute(
      "href",
      "../SpriteEditor/CSS/Elements/SpriteEditor.css"
    );
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
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
    this.canvas_matrix = this.create_canvas_matrix();
  }

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
    });
  }

  set_pixel_size(size) {
    this.pixel_size = parseInt(size);
    this.dispatchEvent(
      new CustomEvent("pixel_size_changed", {
        detail: {
          pixel_size: this.pixel_size,
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
   *
   * @param {String} hexString
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
   * @returns {Array<Array<{hover: Boolean, color: Array<Number>}>>}
   */
  create_canvas_matrix() {
    const matrix = new Array(64);
    for (var i = 0; i < this.height; i++) {
      matrix[i] = new Array(64);

      for (var j = 0; j < this.width; j++) {
        matrix[i][j] = { hover: false, color: [0, 0, 0, 0] };
      }
    }
    return matrix;
  }
  /**
   * Starts gouping pen or erazer points for the action stack
   */
  start_action_buffer() {
    this.action_buffer = [];
  }
  /**
   * Ends grouping and pushes to stack
   */
  end_action_buffer() {
    this.action_stack.push(this.action_buffer);
  }
  /**
   * Reverts the last action done (STRG + Z)
   */
  revert_last_action() {
    if (!this.action_stack.is_empty()) {
      const points = this.action_stack.pop();
      points.forEach((point) => {
        this.canvas_matrix[point.x][point.y].color = point.prev_color;
      });
      this.dispatchEvent(
        new CustomEvent("revert_action", {
          detail: {
            points: points,
          },
        })
      );
    }
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj].color;
      if (
        this.compare_colors(
          this.canvas_matrix[xi][yj].color,
          this.selected_color
        )
      )
        return;
      this.canvas_matrix[xi][yj].color = this.selected_color;
      this.dispatchEvent(
        new CustomEvent("pen_matrix_changed", {
          detail: {
            x: xi,
            y: yj,
            color: this.selected_color,
          },
        })
      );
      this.action_buffer.push({ x: xi, y: yj, prev_color: prev_color });
    });
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  erazer_change_matrix(x, y) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj].color;
      if (this.compare_colors(prev_color, [0, 0, 0, 0])) return;
      this.canvas_matrix[xi][yj].color = [0, 0, 0, 0];
      this.action_buffer.push({ x: xi, y: yj, prev_color: prev_color });
      this.dispatchEvent(
        new CustomEvent("erazer_matrix_changed", {
          detail: {
            x: xi,
            y: yj,
          },
        })
      );
    });
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Boolean} hover
   */
  hover_canvas_matrix(x, y, hover) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      this.canvas_matrix[xi][yj].hover = hover;
      this.dispatchEvent(
        new CustomEvent("hover_matrix_changed", {
          detail: {
            x: xi,
            y: yj,
            hover: hover,
            color: this.canvas_matrix[xi][yj].color,
          },
        })
      );
    });
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
      this.canvas_matrix[x][y].color
    );
    this.fill_visited = {};
    fill_pixels.forEach((pixel) => {
      this.action_buffer.push({
        x: pixel.x,
        y: pixel.y,
        prev_color: this.canvas_matrix[pixel.x][pixel.y].color,
      });
      this.canvas_matrix[pixel.x][pixel.y].color = this.selected_color;
    });
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
      this.compare_colors(this.canvas_matrix[x][y].color, color)
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
    const color = this.canvas_matrix[x][y].color;
    const fill_pixels = [];
    for (var i = 0; i < this.height; i++) {
      for (var j = 0; j < this.width; j++) {
        if (this.compare_colors(this.canvas_matrix[i][j].color, color)) {
          this.action_buffer.push({
            x: i,
            y: j,
            prev_color: this.canvas_matrix[i][j].color,
          });
          this.canvas_matrix[i][j].color = this.selected_color;
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
        prev_color: this.canvas_matrix[x][y].color,
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
      shape_points.forEach((point) => {
        this.apply_to_pixel_block(point.x, point.y, (xi, yj) => {
          this.action_buffer.push({
            x: xi,
            y: yj,
            prev_color: this.canvas_matrix[xi][yj].color,
          });

          this.canvas_matrix[xi][yj].color = this.selected_color;
        });
      });
      this.end_action_buffer();
    }
    this.dispatchEvent(
      new CustomEvent("draw_shape", {
        detail: {
          points: shape_points,
          color: this.selected_color,
          final: final,
        },
      })
    );
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
      points.push({ x: i, y: y1, prev_color: this.canvas_matrix[i][y1].color });
      points.push({ x: i, y: y2, prev_color: this.canvas_matrix[i][x2].color });
    }
    for (
      let j = y1 + y_direction;
      y_direction > 0 ? j < y2 : j > y2;
      j += y_direction
    ) {
      points.push({ x: x1, y: j, prev_color: this.canvas_matrix[x1][j].color });
      points.push({ x: x2, y: j, prev_color: this.canvas_matrix[x2][j].color });
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
        points.push({ x: x, y: y, prev_color: this.canvas_matrix[x][y].color });
        added_points[pointKey] = true;
      }
    }
    return points;
  }
  /**
   * Changes the brightness of the pixel
   * @param {Number} x
   * @param {Number} y
   * @param {Number} brightness
   */
  change_brightness_matrix(x, y, brightness) {
    this.apply_to_pixel_block(x, y, (xi, yj) => {
      const prev_color = this.canvas_matrix[xi][yj].color;
      if (prev_color[3] == 0) return;
      const new_color = [
        Math.min(prev_color[0] + brightness, 255),
        Math.min(prev_color[1] + brightness, 255),
        Math.min(prev_color[2] + brightness, 255),
        prev_color[3],
      ];
      this.canvas_matrix[xi][yj].color = new_color;
      if (
        !this.changed_points.some((point) => point.x === xi && point.y === yj)
      ) {
        this.action_buffer.push({ x: xi, y: yj, prev_color });
        this.changed_points.push({ x: xi, y: yj });
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
      const prev_color = this.canvas_matrix[xi][yj].color;
      if (is_draw) {
        if (
          !this.compare_colors(
            this.canvas_matrix[xi][yj].color,
            this.selected_color
          )
        ) {
          this.canvas_matrix[xi][yj].color = this.selected_color;
          this.dispatchEvent(
            new CustomEvent("pen_matrix_changed", {
              detail: {
                x: xi,
                y: yj,
                color: this.selected_color,
              },
            })
          );
        }
      } else {
        if (!this.compare_colors(prev_color, [0, 0, 0, 0])) {
          this.canvas_matrix[xi][yj].color = [0, 0, 0, 0];
          this.dispatchEvent(
            new CustomEvent("erazer_matrix_changed", {
              detail: {
                x: xi,
                y: yj,
              },
            })
          );
        }
      }
      this.action_buffer.push({ x: xi, y: yj, prev_color: prev_color });
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
        if (
          !this.compare_colors(this.canvas_matrix[i][j].color, [0, 0, 0, 0])
        ) {
          this.move_points.push({
            x: i,
            y: j,
            color: this.canvas_matrix[i][j].color,
          });
          this.action_buffer.push({
            x: i,
            y: j,
            prev_color: this.canvas_matrix[i][j].color,
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
        this.canvas_matrix[new_x][new_y].color = point.color;
        this.action_buffer.unshift({
          x: new_x,
          y: new_y,
          prev_color: [0, 0, 0, 0],
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
          prev_color: this.canvas_matrix[i][j].color,
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
          prev_color: this.canvas_matrix[point.x][point.y].color,
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
            prev_color: this.canvas_matrix[point.x][point.y].color,
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
          prev_color: this.canvas_matrix[point.x][point.y].color,
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
        ? this.canvas_matrix[x][y].color
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
    const target_color = this.canvas_matrix[x][y].color;
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
        this.compare_colors(this.canvas_matrix[x][y].color, target_color)
      ) {
        visited[key] = true;
        this.selected_points.push({
          x,
          y,
          prev_color: this.canvas_matrix[x][y].color,
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
      const originalColor = this.canvas_matrix[point.x][point.y].color;

      return {
        ...point,
        original_color: originalColor,
        selection_color: this.is_transparent(originalColor)
          ? this.selection_color
          : originalColor,
      };
    });
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
          prev_color: this.canvas_matrix[point.x][point.y].color,
        });
        this.canvas_matrix[point.x][point.y].color = point.original_color;
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
    const color = this.canvas_matrix[x][y].color;
    this.selected_color = color;
    const hex_color = this.rgb_array_to_hex(color);
    this.sprite_tools.querySelector("#color_input").value = hex_color;
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
        return new Erazer(this);
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
      y < this.canvas_matrix.length
    );
  }
}

customElements.define("sprite-editor", SpriteEditor);
