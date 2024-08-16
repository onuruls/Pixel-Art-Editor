import { MapEditor } from "../Elements/MapEditor.js";

export class Tool {
  /**
   * Creates an instance of the Tool.
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    this.map_editor = map_editor;
    this.map_canvas = map_editor.map_canvas;
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
   * Destroys the tool by removing event listeners.
   */
  destroy() {
    document.removeEventListener("keydown", this.handle_key_events.bind(this));
  }

  /**
   * Handles key events for the tool.
   * @param {KeyboardEvent} e
   */
  handle_key_events(e) {}

  /**
   * Handles mouse down event.
   * @param {Event} event
   * @throws Will throw an error if called directly.
   */
  mouse_down(event) {
    throw new Error(
      "Abstract mouse_down function was called. Please implement in subclass."
    );
  }

  /**
   * Handles mouse move event.
   * @param {Event} event - The mouse move event.
   * @throws Will throw an error if called directly.
   */
  mouse_move(event) {
    throw new Error(
      "Abstract mouse_move function was called. Please implement in subclass."
    );
  }

  /**
   * Handles mouse up event.
   * @param {Event} event - The mouse up event.
   * @throws Will throw an error if called directly.
   */
  mouse_up(event) {
    throw new Error(
      "Abstract mouse_up function was called. Please implement in subclass."
    );
  }

  /**
   * Handles global mouse up event.
   * @param {Event} event
   */
  global_mouse_up(event) {
    if (this.is_drawing) {
      this.is_drawing = false;
      this.mouse_up(event);
    }
  }

  /**
   * Draws on the canvas based on the event.
   * @param {Event} event
   * @throws Will throw an error if called directly.
   */
  draw(event) {
    throw new Error(
      "Abstract draw function was called. Please implement in subclass."
    );
  }

  /**
   * Handles hover event over the canvas.
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
   * Checks if the hover position has changed.
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
    const rect = this.map_canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (10 * this.map_editor.scale);
    const mouseY = (event.clientY - rect.top) / (10 * this.map_editor.scale);
    const x = Math.floor(mouseX);
    const y = Math.floor(mouseY);

    // Adjust position to fix the offset issue
    return { x: x - 1, y: y - 1 };
  }
}
