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
    this.is_shift_pressed = false;
    this.is_ctrl_pressed = false;
    this.hover_position = { x: 0, y: 0 };
    this.last_position = { x: 0, y: 0 };
    this.handle_key_down_events_bind = this.handle_key_down_events.bind(this);
    this.handle_key_up_events_bind = this.handle_key_up_events.bind(this);
    this.init();
  }

  /**
   * Adds all key listeners
   */
  init() {
    document.addEventListener("keydown", this.handle_key_down_events_bind);
    document.addEventListener("keyup", this.handle_key_up_events_bind);
  }

  /**
   * Removes all key listeners
   */
  destroy() {
    document.removeEventListener("keydown", this.handle_key_down_events_bind);
    document.removeEventListener("keyup", this.handle_key_up_events_bind);
    console.log("!");
  }

  /**
   * Handles all the keydown-Events of a tool e.g. CTRL + C
   */
  handle_key_down_events(e) {
    this.is_shift_pressed = e.shiftKey;
    this.is_ctrl_pressed = e.ctrlKey;
  }

  /**
   * Handles all the keyup-Events of a tool
   */
  handle_key_up_events(e) {
    this.is_shift_pressed = e.shiftKey;
    this.is_ctrl_pressed = e.ctrlKey;
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
    const tile_size = this.sprite_editor.tile_size;
    const x = Math.floor(mouseX / tile_size);
    const y = Math.floor(mouseY / tile_size);
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
    const tile_size = this.sprite_editor.tile_size;
    const x = Math.floor(mouse_x / tile_size);
    const y = Math.floor(mouse_y / tile_size);
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
