import { MapEditorPart } from "./MapEditorPart.js";
import { MapEditor } from "./MapEditor.js";

export class MapEditorCanvas extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
        <div class="canvas-wrapper">
          <canvas id="drawing_canvas"></canvas>
        </div>
      `;
  }

  /**
   * place for all the event listener
   */
  init() {
    this.drawing_canvas = this.querySelector("#drawing_canvas");
    this.context = this.drawing_canvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.drawing_canvas.height = 640;
    this.drawing_canvas.width = 640;
    this.drawing_canvas.addEventListener("resize", (event) => {
      this.drawing_canvas.height = event.target.getBoundingClientRect().height;
      this.drawing_canvas.width = event.target.getBoundingClientRect().width;
    });

    this.drawing_canvas.addEventListener("mousedown", (event) => {
      this.map_editor.selected_tool.mouse_down(event);
    });

    this.drawing_canvas.addEventListener("mousemove", (event) => {
      this.map_editor.selected_tool.mouse_move(event);
    });

    this.drawing_canvas.addEventListener("mouseup", (event) => {
      this.map_editor.selected_tool.mouse_up(event);
    });

    window.addEventListener("mouseup", (event) => {
      this.map_editor.selected_tool.global_mouse_up(event);
    });

    this.map_editor.addEventListener("pen_matrix_changed", (event) => {
      this.draw_pen_canvas(event);
    });

    this.map_editor.addEventListener("hover_matrix_changed", (event) => {
      this.draw_hover(event);
    });
  }

  /**
   * Pen tool
   * @param {Event} event
   */
  draw_pen_canvas(event) {
    let x = event.detail.x;
    let y = event.detail.y;
    let imageSrc = event.detail.image;

    this.paint_single_pixel(x, y, imageSrc);
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Boolean} hover
   */
  draw_hover(event) {
    const x = event.detail.x;
    const y = event.detail.y;
    const hover = event.detail.hover;

    this.context.clearRect(x * 10, y * 10, 10, 10);

    if (hover) {
      const hoverColor = "rgba(180, 240, 213, 0.5)";
      this.context.fillStyle = hoverColor;
      this.context.fillRect(x * 10, y * 10, 10, 10);
    }

    const imageSrc = this.map_editor.canvas_matrix[x][y].image;
    if (imageSrc) {
      this.paint_single_pixel(x, y, imageSrc);
    }
  }

  /**
   * Paints a pixel using an image
   * @param {Number} x
   * @param {Number} y
   * @param {String} imageSrc
   */
  paint_single_pixel(x, y, imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      this.context.drawImage(img, x * 10, y * 10, 10, 10);
    };
  }
}

customElements.define("map-editor-canvas", MapEditorCanvas);
