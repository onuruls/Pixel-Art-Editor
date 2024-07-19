import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorLayers } from "./MapEditorLayers.js";
import { MapEditorMapPreview } from "./MapEditorMapPreview.js";
import { MapEditorSpritePreview } from "./MapEditorSpriteView.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";
import { Pen } from "../Tools/Pen.js";

export class MapEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.selected_tool = null;
    this.canvas_matrix = [];
    this.width = 64;
    this.height = 64;

    this.initialized = false;
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
    this.css = document.createElement("link");
    this.css.setAttribute("href", "../MapEditor/CSS/Elements/MapEditor.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.map_tools = new MapEditorTools(this);
    this.map_canvas = new MapEditorCanvas(this);
    this.map_selection_area = new MapEditorSelectionArea(this);
    this.map_layers = new MapEditorLayers(this);
    this.map_map_preview = new MapEditorMapPreview(this);
    this.map_sprite_preview = new MapEditorSpritePreview(this);
    this.appendChild(this.map_tools);
    this.appendChild(this.map_canvas);
    this.appendChild(this.map_selection_area);
    this.set_listeners();
    this.selected_tool = new Pen(this);
    this.selected_asset = null;
    this.canvas_matrix = this.create_canvas_matrix();
    this.initialized = true;
  }

  /**
   * Sets the necessary eventlisteners
   */
  set_listeners() {
    const toolbox = this.map_tools.querySelector(".toolbox");
    toolbox.addEventListener("click", (event) => {
      const clickedElement = event.target.closest(".tool-button");
      if (clickedElement) {
        const tool = clickedElement.dataset.tool;
        this.selected_tool.destroy();
        this.selected_tool = this.select_tool_from_string(tool);
      }
    });

    const assetButtons = this.map_tools.querySelectorAll(".asset-button");
    assetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.selected_image = button.querySelector("img").src;
      });
    });
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
   *
   * @param {Number} x
   * @param {Number} y
   */
  pen_change_matrix(x, y) {
    if (this.selected_image) {
      this.canvas_matrix[x][y].image = this.selected_image;
      this.dispatchEvent(
        new CustomEvent("pen_matrix_changed", {
          detail: {
            x: x,
            y: y,
            image: this.selected_image,
          },
        })
      );
    }
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
   * Gets the fitting tool, when clicked
   * @param {String} string
   */
  select_tool_from_string(string) {
    switch (string) {
      case "pen":
        return new Pen(this);
      default:
        return new Pen(this);
    }
  }
}

customElements.define("map-editor", MapEditor);
