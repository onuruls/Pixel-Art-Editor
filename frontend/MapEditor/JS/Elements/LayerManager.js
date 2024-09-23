import { ActionStack } from "../../../MapEditor/JS/Classes/ActionStack.js";
import { MapEditor } from "./MapEditor.js";

export class LayerManager {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    this.map_editor = map_editor;
    this.layers = [];
    this.active_layer_index = 0;
    this.layer_stacks = new Map();
  }

  /**
   * Adds a new layer
   * @param {Array} layer
   * @returns {number} The index of the newly added layer
   */
  add_layer(layer) {
    const newIndex = this.layers.length;
    this.layers.push({ content: layer, visible: true });
    this.layer_stacks.set(newIndex, new ActionStack());

    if (newIndex === 0) {
      this.active_layer_index = 0;
    }

    return newIndex;
  }

  /**
   * Loads a single layer when, a file is loaded into the MapEditor
   * @param {{content: Array<Array<String>>, visible: Boolean}} full_layer
   * @returns {Number}
   */
  load_layer(full_layer) {
    const newIndex = this.layers.length;
    this.layers.push(full_layer);
    this.layer_stacks.set(newIndex, new ActionStack());

    if (newIndex === 0) {
      this.active_layer_index = 0;
    }

    return newIndex;
  }

  /**
   * Removes a layer at the specified index
   * @param {number} index
   */
  remove_layer(index) {
    if (this.layers.length > 1) {
      this.layers.splice(index, 1);
      this.layer_stacks.delete(index);

      if (this.active_layer_index >= index) {
        this.active_layer_index = Math.max(0, this.active_layer_index - 1);
      }

      this.reassign_action_stacks(index);
    }
  }

  /**
   * Reassigns action stacks after a layer is removed or moved
   * @param {number} removedIndex
   */
  reassign_action_stacks(removedIndex) {
    const newLayerStacks = new Map();

    this.layer_stacks.forEach((stack, key) => {
      const adjustedKey = key > removedIndex ? key - 1 : key;
      newLayerStacks.set(adjustedKey, stack);
    });

    this.layer_stacks = newLayerStacks;
  }

  /**
   * Swaps two layers and their associated action stacks
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  swap_layers(fromIndex, toIndex) {
    const layers = this.layers;

    [layers[fromIndex], layers[toIndex]] = [layers[toIndex], layers[fromIndex]];

    const fromStack = this.layer_stacks.get(fromIndex);
    const toStack = this.layer_stacks.get(toIndex);
    this.layer_stacks.set(fromIndex, toStack);
    this.layer_stacks.set(toIndex, fromStack);

    if (this.active_layer_index === fromIndex) {
      this.active_layer_index = toIndex;
    } else if (this.active_layer_index === toIndex) {
      this.active_layer_index = fromIndex;
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
   * @returns {Array}
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

  /**
   * Combines all the layers into one layer
   * so that the lower layers get overwritten by the upper ones
   * @returns {Array<Array<String>>}
   */
  combine_layers() {
    let remaining_entries = [];
    let index = 1;
    const matrix = this.layers[this.layers.length - index].content.map(
      (row) => [...row]
    );

    matrix.forEach((col, col_i) =>
      col.forEach((row, row_i) => {
        if (!row) {
          remaining_entries.push({ x: col_i, y: row_i });
        }
      })
    );

    while (this.layers.length - index > 0) {
      index++;
      const rest = [];
      const content = this.layers[this.layers.length - index].content;
      remaining_entries.forEach((entry) => {
        const _entry = content[entry.x][entry.y];
        if (_entry) {
          matrix[entry.x][entry.y] = _entry;
        } else {
          rest.push({ x: entry.x, y: entry.y });
        }
      });
      remaining_entries = rest;
    }
    return matrix;
  }

  /**
   * Resets the LayerManager before another file is loaded
   */
  reset() {
    this.layers = [];
    this.active_layer_index = 0;
    this.layer_stacks = new Map();
  }
}
