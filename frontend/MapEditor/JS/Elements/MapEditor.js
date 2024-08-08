import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { ActionStack } from "../../../MapEditor/JS/Classes/ActionStack.js";
import { Pen } from "../Tools/Pen.js";
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
    this.canvas_matrix = Array(64)
      .fill("")
      .map(() => Array(64).fill(""));
    this.width = 64;
    this.height = 64;
    this.initialized = false;
    this.selected_points = [];
    this.pixel_size = 1;
    this.selected_asset = null;
    this.action_stack = new ActionStack();
    this.action_buffer = [];
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
  }

  /**
   * Adjusts the zoom level and location
   * @param {Number} zoom_level
   */
  apply_zoom(zoom_level, mouseX, mouseY) {
    const canvasWrapper = this.map_canvas.querySelector(".canvas-wrapper");
    const currentMouseX = (mouseX + canvasWrapper.scrollLeft) / this.scale;
    const currentMouseY = (mouseY + canvasWrapper.scrollTop) / this.scale;

    this.scale = Math.min(Math.max(this.scale + zoom_level, 1.0), 2.0);

    const newMouseX = (mouseX + canvasWrapper.scrollLeft) / this.scale;
    const newMouseY = (mouseY + canvasWrapper.scrollTop) / this.scale;

    canvasWrapper.style.backgroundSize = `${10 * this.scale}px ${
      10 * this.scale
    }px`;
    this.map_canvas.querySelectorAll("canvas").forEach((canvas) => {
      canvas.width = 640 * this.scale;
      canvas.height = 640 * this.scale;
    });

    const deltaX = (currentMouseX - newMouseX) * this.scale;
    const deltaY = (currentMouseY - newMouseY) * this.scale;

    canvasWrapper.scrollLeft += deltaX;
    canvasWrapper.scrollTop += deltaY;

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
    this.action_stack.push(this.action_buffer);
  }

  /**
   * Reverts the last action done (STRG + Z)
   */
  revert_last_action() {
    if (!this.action_stack.actions_is_empty()) {
      const points = this.action_stack.pop_last_action();
      points.forEach((point) => {
        this.canvas_matrix[point.x][point.y] = point.prev_asset;
      });
      this.dispatchEvent(
        new CustomEvent("revert_undo", { detail: { points: points } })
      );
    }
  }

  /**
   * Redoing the last reverted action
   */
  redo_last_action() {
    if (!this.action_stack.redo_is_empty()) {
      const points = this.action_stack.pop_last_redo();
      points.forEach((point) => {
        this.canvas_matrix[point.x][point.y] = point.asset;
      });
      this.dispatchEvent(
        new CustomEvent("revert_redo", { detail: { points: points } })
      );
    }
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    if (this.selected_asset) {
      const img = new Image();
      img.src = this.selected_asset;
      img.onload = () => {
        this.apply_to_pixel_block(x, y, (xi, yj) => {
          const prev_asset = this.canvas_matrix[xi][yj];
          if (prev_asset === this.selected_asset) return;
          this.canvas_matrix[xi][yj] = this.selected_asset;
          this.action_buffer.push({
            x: xi,
            y: yj,
            prev_asset: prev_asset,
            asset: this.selected_asset,
          });
          this.dispatchEvent(
            new CustomEvent("pen_matrix_changed", {
              detail: {
                x: xi,
                y: yj,
                asset: img,
              },
            })
          );
        });
      };
    }
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
   * Gets the fitting tool, when clicked
   * @param {String} string
   */
  select_tool_from_string(string) {
    switch (string) {
      case "pen":
        return new Pen(this);
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
      x < this.canvas_matrix.length &&
      y < this.canvas_matrix.length
    );
  }
}

customElements.define("map-editor", MapEditor);
