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
    this.update_cursor_for_tool("pen");
    this.selected_color = this.hex_to_rgb_array(
      this.sprite_tools.querySelector("#color_input").value
    );
    this.init_canvas_matrix();
  }
  
  set_listeners() {
    const toolbox = this.sprite_tools.querySelector(".toolbox");
    toolbox.addEventListener("click", (event) => {
      const clickedElement = event.target.closest(".tool-button");
      if (clickedElement) {
        const tool = clickedElement.dataset.tool;
        this.selected_tool = this.select_tool_from_string(tool);
        this.update_cursor_for_tool(tool);
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
   */
  init_canvas_matrix() {
    this.canvas_matrix = new Array(64);
    for (var i = 0; i < this.height; i++) {
      this.canvas_matrix[i] = new Array(64);

      for (var j = 0; j < this.width; j++) {
        this.canvas_matrix[i][j] = { hover: false, color: [0, 0, 0, 0] };
      }
    }
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
    const prev_color = this.canvas_matrix[x][y].color;
    if (this.canvas_matrix[x][y].color === this.selected_color) return;
    this.canvas_matrix[x][y].color = this.selected_color;
    this.dispatchEvent(
      new CustomEvent("pen_matrix_changed", {
        detail: {
          x: x,
          y: y,
          color: this.selected_color,
        },
      })
    );
    this.action_buffer.push({ x: x, y: y, prev_color: prev_color });
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  erazer_change_matrix(x, y) {
    const prev_color = this.canvas_matrix[x][y].color;
    if (this.compare_colors(prev_color, [0, 0, 0, 0])) return;
    this.canvas_matrix[x][y].color = [0, 0, 0, 0];
    this.action_buffer.push({ x: x, y: y, prev_color: prev_color });
    this.dispatchEvent(
      new CustomEvent("erazer_matrix_changed", {
        detail: {
          x: x,
          y: y,
        },
      })
    );
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Boolean} hover
   */
  hover_canvas_matrix(x, y, hover) {
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) {
      return;
    }
    this.canvas_matrix[x][y].hover = hover;
    this.dispatchEvent(
      new CustomEvent("hover_matrix_changed", {
        detail: {
          x: x,
          y: y,
          hover: hover,
          color: this.canvas_matrix[x][y].color,
        },
      })
    );
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
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} final
   */
  draw_line_matrix(x1, y1, x2, y2, final = false) {
    const line_points = this.calculate_line_points(x1, y1, x2, y2);
    if (final) {
      this.start_action_buffer();
      line_points.forEach((point) => {
        this.action_buffer.push({
          x: point.x,
          y: point.y,
          prev_color: this.canvas_matrix[point.x][point.y].color,
        });
        this.canvas_matrix[point.x][point.y].color = this.selected_color;
      });
      this.end_action_buffer();
    }
    this.dispatchEvent(
      new CustomEvent("draw_stroke_line", {
        detail: {
          points: line_points,
          color: this.selected_color,
          final: final,
        },
      })
    );
  }
  /**
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number, old_color: Array<Number>}>}
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
        old_color: this.canvas_matrix[x][y].color,
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
   *
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   */
  compare_colors(color1, color2) {
    return JSON.stringify(color1) === JSON.stringify(color2);
  }

  /**
   *
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
   *
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
      default:
        return new Pen(this);
    }
  }

  /**
   *
   * @param {String} tool
   */
  update_cursor_for_tool(tool) {
    const canvas = this.sprite_canvas.querySelector("canvas");
    canvas.classList.remove(
      "using-pen",
      "using-eraser",
      "using-move",
      "using-color-picker"
    );
    switch (tool) {
      case "pen":
      case "mirror_pen":
        canvas.classList.add("using-pen");
        break;

      case "eraser":
        canvas.classList.add("using-eraser");
        break;
      case "move":
        canvas.classList.add("using-move");
        break;
      case "color_picker":
        canvas.classList.add("using-color-picker");
        break;
      default:
        canvas.classList.remove(
          "using-pen",
          "using-eraser",
          "using-move",
          "using-color-picker"
        );
    }
  }
}

customElements.define("sprite-editor", SpriteEditor);
