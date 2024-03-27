import { SpritePreview } from "./SpritePreview.js";
import { SpriteCanvas } from "./SpriteCanvas.js";
import { SpriteTools } from "./SpriteTools.js";
import { Erazer } from "../Tools/Erazer.js";
import { Pen } from "../Tools/Pen.js";
import { MirrorPen } from "../Tools/MirrorPen.js";
import { Bucket } from "../Tools/Bucket.js";

export class SpriteEditor extends HTMLElement {
  constructor() {
    super();
    this.selected_tool = null;
    this.canvas_matrix = [];
    this.width = 64;
    this.height = 64;
    this.fill_visited = {};
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
    this.setToolsListeners();
    this.selected_tool = new Pen(this);
    this.selected_color = this.hexToRgbArray(
      this.sprite_tools.querySelector("#color_input").value
    );
    this.init_canvas_matrix();
  }

  setToolsListeners() {
    this.sprite_tools.querySelector("ul").addEventListener("click", (event) => {
      const clicked_element = event.target;
      if (
        clicked_element.tagName === "INPUT" &&
        clicked_element.type === "radio"
      ) {
        this.selected_tool = this.selectToolFromString(clicked_element.id);
      }
    });
    this.sprite_tools
      .querySelector("#color_input")
      .addEventListener("input", (event) => {
        this.selected_color = this.hexToRgbArray(event.target.value);
      });
  }
  hexToRgbArray(hexString) {
    hexString = hexString.replace(/^#/, "");
    const bigint = parseInt(hexString, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const a = 255;
    return [r, g, b, a];
  }
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
   *
   * @param {Number} x
   * @param {Number} y
   */
  change_canvas_matrix(x, y, erase = false) {
    this.canvas_matrix[x][y].color = this.selected_color;
    this.dispatchEvent(
      new CustomEvent("canvas_matrix_changed", {
        detail: {
          x: x,
          y: y,
          erase: erase,
          hover: false,
          color: this.selected_color,
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
    // if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) {
    //   return;
    // }
    // this.canvas_matrix[x][y].hover = hover;
    // this.dispatchEvent(
    //   new CustomEvent("hover_matrix_changed", {
    //     detail: {
    //       x: x,
    //       y: y,
    //       hover: hover,
    //       color: this.canvas_matrix[x][y].color,
    //     },
    //   })
    // );
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  fill_change_matrix(x, y) {
    const fill_pixels = this.recursive_fill_matrix(
      x,
      y,
      this.canvas_matrix[x][y].color
    );
    fill_pixels.forEach((pixel) => {
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
    console.log("FILL PIXELS", fill_pixels);
  }
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Array}
   */
  recursive_fill_matrix(x, y) {
    if (
      this.fill_visited[`${x}_${y}`] === undefined &&
      this.compare_colors(
        this.canvas_matrix[x][y].color,
        this.selected_color
      ) &&
      x >= 0 &&
      y >= 0
    ) {
      const self = { x: x, y: y };
      this.fill_visited[`${x}_${y}`] = false;
      return [
        self,
        ...this.recursive_fill_matrix(x + 1, y),
        ...this.recursive_fill_matrix(x - 1, y),
        ...this.recursive_fill_matrix(x, y + 1),
        ...this.recursive_fill_matrix(x, y - 1),
      ];
    } else {
      return [];
    }
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
   * @param {String} string
   */
  selectToolFromString(string) {
    switch (string) {
      case "pen":
        return new Pen(this);
        this.sprite_canvas.style.cursor = "";
      case "eraser":
        return new Erazer(this);
      case "mirror_pen":
        return new MirrorPen(this);
      case "bucket":
        return new Bucket(this);
      default:
        return new Pen(this);
    }
  }

  /**
   *
   * @param {String} tool
   */
  update_selected_tool(tool) {
    this.selected_tool = tool;
  }
}

customElements.define("sprite-editor", SpriteEditor);
