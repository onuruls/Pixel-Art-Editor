import { SpriteEditor } from "../Elements/SpriteEditor.js";

export class Tool {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    this.sprite_editor = sprite_editor;
    this.canvas = sprite_editor.sprite_canvas.drawing_canvas;
    this.is_drawing = false;
    this.hover_position = {
      x: 0,
      y: 0,
    };
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
    this.is_drawing = false;
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
      this.sprite_editor.hover_canvas_matrix(
        this.hover_position.x,
        this.hover_position.y,
        false
      );
      this.hover_position = {
        x: Math.abs(x),
        y: Math.abs(y),
      };
      this.sprite_editor.hover_canvas_matrix(x, y, true);
    }
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
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
}
