export class ActionStack {
  constructor() {
    this.actions = [];
  }
  /**
   *
   * @param {Array<{x: Number, y: Number, prev_color: Array<Number>}} points_array
   */
  push(points_array) {
    this.actions.push(points_array);
  }
  /**
   *
   * @returns {Array<{x: Number, y: Number, prev_color: Array<Number>}}
   */
  pop() {
    if (this.is_empty()) {
      return undefined;
    } else {
      return this.actions.pop();
    }
  }
  /**
   * @returns {Number}
   */
  size() {
    return this.actions.length;
  }
  /**
   * @returns {Boolean}
   */
  is_empty() {
    return this.actions.length === 0;
  }
  /**
   *
   */
  clear() {
    this.actions = [];
  }
}
