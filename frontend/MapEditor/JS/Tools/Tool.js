import { MapEditor } from "../Elements/MapEditor.js";

export class Tool {
  /**
   * Creates an instance of the Tool.
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    this.map_editor = map_editor;
    this.is_drawing = false;
    this.hover_position = { x: 0, y: 0 };
    this.last_position = { x: 0, y: 0 };
    this.init();
  }

  /**
   * Initializes the tool and adds necessary event listeners.
   */
  init() {
    document.addEventListener("keydown", this.handle_key_events.bind(this));
  }

  /**
   * Removes all key listeners
   */
  destroy() {
    document.removeEventListener("keydown", this.handle_key_events.bind(this));
  }

  /**
   * Handles all the keydown-Events of a tool e.g. CTRL + C
   */
  handle_key_events(e) {}

  /**
   *
   * @param {Event} event
   */
  mouse_down(event) {
    throw new Error(
      "Abstract mouse_down function was called. Please implement in subclass."
    );
  }

  /**
   *
   * @param {Event} event
   */
  mouse_move(event) {
    throw new Error(
      "Abstract mouse_move function was called. Please implement in subclass."
    );
  }

  /**
   *
   * @param {Event} event
   */
  mouse_up(event) {
    throw new Error(
      "Abstract mouse_up function was called. Please implement in subclass."
    );
  }

  /**
   *
   * @param {Event} event
   */
  global_mouse_up(event) {
    if (this.is_drawing) {
      this.is_drawing = false;
      this.mouse_up(event);
    }
  }

  /**
   *
   * @param {Event} event
   */
  draw(event) {
    throw new Error(
      "Abstract draw function was called. Please implement in subclass."
    );
  }

  /**
   *
   * @param {Event} event
   */
  hover(event) {
    const { x, y } = this.get_mouse_position(event);
    if (this.has_hover_position_changed(x, y)) {
      this.hover_position = { x: Math.abs(x), y: Math.abs(y) };
      this.map_editor.hover_canvas_matrix(x, y);
    }
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  has_hover_position_changed(x, y) {
    return !(x === this.hover_position.x && y === this.hover_position.y);
  }

  /**
   * Calculates mouse position from event.
   * @param {Event} event
   * @returns {{x: Number, y: Number}}
   */
  get_mouse_position(event) {
    const activeLayerCanvas =
      this.map_editor.map_canvas.layer_canvases[
        this.map_editor.layer_manager.active_layer_index
      ];
    const rect = activeLayerCanvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (10 * this.map_editor.scale);
    const mouseY = (event.clientY - rect.top) / (10 * this.map_editor.scale);
    const x = Math.floor(mouseX);
    const y = Math.floor(mouseY);
    return { x, y };
  }
}
