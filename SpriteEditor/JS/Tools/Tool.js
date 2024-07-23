import { SpriteEditor } from "../Elements/SpriteEditor.js";

export class Tool {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    this.sprite_editor = sprite_editor;
    this.canvas = sprite_editor.sprite_canvas.drawing_canvas.canvas;
    this.is_drawing = false;
    this.hover_position = {
      x: 0,
      y: 0,
    };
    this.last_position = {
      x: 0,
      y: 0,
    };
    this.init();
  }

  /**
   * Adds all key listeners
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
  handle_key_events(e) {
    console.log("Key events in tool class");
  }

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
    var rect = this.canvas.getBoundingClientRect();
    var mouseX = event.clientX - rect.left;
    var mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / 10);
    const y = Math.floor(mouseY / 10);
    const position_changed = this.has_hover_position_changed(x, y);
    if (position_changed) {
      this.hover_position = {
        x: Math.abs(x),
        y: Math.abs(y),
      };
    }
    this.sprite_editor.hover_canvas_matrix(x, y);
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
   *
   * @param {Number} r
   * @param {Number} g
   * @param {Number} b
   * @param {Number} a
   */
  build_rgba_string(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  /**
   * Calculates mouse position from event.
   * @param {Event} event
   * @returns {{x: Number, y: Number}}
   */
  get_mouse_position(event) {
    var rect = this.canvas.getBoundingClientRect();
    var mouse_x = event.clientX - rect.left;
    var mouse_y = event.clientY - rect.top;
    const x = Math.floor(mouse_x / 10);
    const y = Math.floor(mouse_y / 10);
    return { x: x, y: y };
  }
  /**
   * Sets the cursor-icon on the canvas element.
   */
  activate_cursor_icon() {
    const canvas = this.canvas;
    canvas.style.cursor = `url('${this.cursor_icon_url}'), auto`;
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  has_mouse_position_changed(x, y) {
    return !(x === this.last_position.x && y === this.last_position.y);
  }
}
