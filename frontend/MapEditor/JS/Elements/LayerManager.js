import { ActionStack } from "../../../MapEditor/JS/Classes/ActionStack.js";

export class LayerManager {
  constructor() {
    this.layers = [];
    this.active_layer_index = 0;
    this.layer_stacks = new Map();
  }

  /**
   * Adds a new layer
   * @param {Array} layer
   */
  add_layer(layer) {
    this.layers.push({ content: layer, visible: true });
    this.layer_stacks.set(this.layers.length - 1, new ActionStack());
    if (this.layers.length === 1) {
      this.active_layer_index = 0;
    }
  }

  /**
   * Removes a layer at the specified index
   * @param {number} index
   */
  remove_layer(index) {
    if (this.layers.length > 1) {
      this.layers.splice(index, 1);
      this.layer_stacks.delete(index);
      this.active_layer_index = Math.max(0, this.active_layer_index - 1);
    }
  }

  /**
   * Toggles the visibility of a layer
   * @param {number} index
   */
  toggle_layer_visibility(index) {
    if (index >= 0 && index < this.layers.length) {
      this.layers[index].visible = !this.layers[index].visible;
    }
  }

  /**
   * Switches to the layer at the specified index
   * @param {number} index
   */
  switch_layer(index) {
    if (index >= 0 && index < this.layers.length) {
      this.active_layer_index = index;
    } else {
      console.error("Invalid layer index:", index);
    }
  }

  /**
   * Gets the currently active layer
   * @returns {Array} The active layer
   */
  get_active_layer() {
    return this.layers[this.active_layer_index].content;
  }

  /**
   * Gets whether a layer is visible
   * @param {number} index
   * @returns {boolean}
   */
  is_layer_visible(index) {
    return this.layers[index].visible;
  }

  /**
   * Reverts the last action done on the active layer
   * @param {Function} apply_undo
   */
  revert_last_action(apply_undo) {
    const current_stack = this.layer_stacks.get(this.active_layer_index);
    if (current_stack && !current_stack.actions_is_empty()) {
      const points = current_stack.pop_last_action();
      points.forEach((point) => {
        this.get_active_layer()[point.x][point.y] = point.prev_asset;
        apply_undo(point);
      });
    }
  }

  /**
   * Redoes the last reverted action on the active layer
   * @param {Function} apply_redo
   */
  redo_last_action(apply_redo) {
    const current_stack = this.layer_stacks.get(this.active_layer_index);
    if (current_stack && !current_stack.redo_is_empty()) {
      const points = current_stack.pop_last_redo();
      points.forEach((point) => {
        this.get_active_layer()[point.x][point.y] = point.asset;
        apply_redo(point);
      });
    }
  }
}
