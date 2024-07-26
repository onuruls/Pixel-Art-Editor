import { SpriteEditor } from "../Elements/SpriteEditor.js";

export class ActionStack {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    this.sprite_editor = sprite_editor;
    this.actions = [];
    this.redo_actions = [];
  }
  /**
   * Pushes a action on the action_stack
   * @param {Array<{x: Number, y: Number, prev_color: Array<Number>, color: Array<Number>}} points_array
   */
  push(points_array) {
    this.actions.push(points_array);
    this.redo_actions = [];
    this.sprite_editor.update_frame_canvas();
  }
  /**
   * Returns the last action from the stack
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>, color: Array<Number>}}
   */
  pop_last_action() {
    if (this.actions_is_empty()) {
      return undefined;
    } else {
      const action = this.actions.pop();
      this.redo_actions.push(action);
      return action;
    }
  }

  /**
   * Returns true if action_stack is empty
   * @returns {Boolean}
   */
  actions_is_empty() {
    return this.actions.length === 0;
  }

  /**
   * Returns true if redo_stack is empty
   * @returns {Boolean}
   */
  redo_is_empty() {
    return this.redo_actions.length === 0;
  }

  /**
   * Returns the last redo_action
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>, color: Array<Number>}}
   */
  pop_last_redo() {
    const redo = this.redo_actions.pop();
    this.actions.push(redo);
    return redo;
  }
}
