export class EditorUtil {
  /**
   * Calculates the line points using Bresenham's line algorithm
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number}>}
   */
  static calculate_line_points(x1, y1, x2, y2) {
    const line_points = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const step_x = x1 < x2 ? 1 : -1;
    const step_y = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    while (true) {
      line_points.push({ x: x, y: y });

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += step_x;
      }
      if (e2 < dx) {
        err += dx;
        y += step_y;
      }
    }
    return line_points;
  }

  /**
   * Calculates the rectangle points
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Array} matrix - The canvas matrix to use
   * @returns {Array<{x: Number, y: Number}>}
   */
  static calculate_rectangle_points(x1, y1, x2, y2, matrix) {
    const points = [];
    const y_direction = y1 - y2 > 0 ? -1 : 1;
    const x_direction = x1 - x2 > 0 ? -1 : 1;
    for (let i = x1; x_direction > 0 ? i <= x2 : i >= x2; i += x_direction) {
      points.push({ x: i, y: y1, prev_color: matrix[i][y1] });
      points.push({ x: i, y: y2, prev_color: matrix[i][y2] });
    }
    for (
      let j = y1 + y_direction;
      y_direction > 0 ? j < y2 : j > y2;
      j += y_direction
    ) {
      points.push({ x: x1, y: j, prev_color: matrix[x1][j] });
      points.push({ x: x2, y: j, prev_color: matrix[x2][j] });
    }
    return points;
  }

  /**
   * Calculates the circle points using a midpoint circle algorithm
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Array} matrix
   * @returns {Array<{x: Number, y: Number}>}
   */
  static calculate_circle_points(x1, y1, x2, y2, matrix) {
    const points = [];
    const added_points = [];
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = Math.min(x1, x2) + radiusX;
    const centerY = Math.min(y1, y2) + radiusY;
    const step = 1 / Math.max(radiusX, radiusY);
    for (let a = 0; a < 2 * Math.PI; a += step) {
      const x = Math.round(centerX + radiusX * Math.cos(a));
      const y = Math.round(centerY + radiusY * Math.sin(a));
      const pointKey = `${x},${y}`;
      if (!added_points[pointKey]) {
        points.push({ x: x, y: y, prev_color: matrix[x][y] });
        added_points[pointKey] = true;
      }
    }
    return points;
  }

  /**
   * Calculates the aspect ratio to maintain a 1:1 ratio if the Shift key is held.
   * @param {number} start_x
   * @param {number} start_y
   * @param {number} end_x
   * @param {number} end_y
   * @param {boolean} shiftKey
   * @returns {{ end_x: number, end_y: number }}
   */
  static calculate_aspect_ratio(start_x, start_y, end_x, end_y, shiftKey) {
    if (shiftKey) {
      const width = Math.abs(end_x - start_x);
      const height = Math.abs(end_y - start_y);
      const size = Math.min(width, height);

      if (end_x < start_x) {
        end_x = start_x - size;
      } else {
        end_x = start_x + size;
      }

      if (end_y < start_y) {
        end_y = start_y - size;
      } else {
        end_y = start_y + size;
      }
    }
    return { end_x, end_y };
  }

  /**
   * Recursively fills the matrix with the selected color or asset
   * @param {Number} x
   * @param {Number} y
   * @param {Array} matrix
   * @param {Array|String} fill_color
   * @param {Object} fill_visited - Visited pixels
   * @param {Function} compare_colors - Function to compare colors or assets
   * @returns {Array}
   */
  static recursive_fill_matrix(
    x,
    y,
    matrix,
    fill_color,
    fill_visited,
    compare_colors
  ) {
    if (
      fill_visited[`${x}_${y}`] === undefined &&
      x >= 0 &&
      x < matrix.length &&
      y >= 0 &&
      y < matrix[0].length &&
      compare_colors(matrix[x][y], fill_color)
    ) {
      const self = { x: x, y: y };
      fill_visited[`${x}_${y}`] = false;
      return [
        self,
        ...EditorUtil.recursive_fill_matrix(
          x + 1,
          y,
          matrix,
          fill_color,
          fill_visited,
          compare_colors
        ),
        ...EditorUtil.recursive_fill_matrix(
          x - 1,
          y,
          matrix,
          fill_color,
          fill_visited,
          compare_colors
        ),
        ...EditorUtil.recursive_fill_matrix(
          x,
          y + 1,
          matrix,
          fill_color,
          fill_visited,
          compare_colors
        ),
        ...EditorUtil.recursive_fill_matrix(
          x,
          y - 1,
          matrix,
          fill_color,
          fill_visited,
          compare_colors
        ),
      ];
    } else {
      return [];
    }
  }

  /**
   * Compares two points
   * @param {x: Number, y: Number} point1
   * @param {x: Number, y: Number} point2
   * @returns {Boolean}
   */
  static compare_points(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  /**
   * Checks if a point is already selected (already in selected_points)
   * @param {{x: Number, y: Number}} point
   * @param {Array} selected_points
   * @returns {Boolean}
   */
  static is_point_already_selected(point, selected_points) {
    if (selected_points.length === 0) return false;
    return selected_points.some((p) => EditorUtil.compare_points(p, point));
  }

  /**
   * Calculates the difference between the move startpoint and current position
   * @param {{x: Number, y: Number}} start_point
   * @param {{x: Number, y: Number}} position
   * @returns {{x: Number, y: Number}}
   */
  static calculate_move_difference(start_point, position) {
    return {
      x: start_point.x - position.x,
      y: start_point.y - position.y,
    };
  }

  /**
   * Applies the given action to a block of pixels defined by pixel size
   * @param {Number} x
   * @param {Number} y
   * @param {Number} pixel_size
   * @param {Function} action
   * @param {Array} matrix
   */
  static apply_to_pixel_block(x, y, pixel_size, matrix, action) {
    for (let i = 0; i < pixel_size; i++) {
      for (let j = 0; j < pixel_size; j++) {
        const xi = x + i;
        const yj = y + j;
        if (EditorUtil.coordinates_in_bounds(xi, yj, matrix)) {
          action(xi, yj);
        }
      }
    }
  }

  /**
   * Checks if the coordinates are within the canvas bounds
   * @param {Number} x
   * @param {Number} y
   * @param {Array} matrix
   * @returns {Boolean}
   */
  static coordinates_in_bounds(x, y, matrix) {
    return x >= 0 && y >= 0 && x < matrix.length && y < matrix[0].length;
  }
}
