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
   * @returns {Array<{x: Number, y: Number}>}
   */
  static calculate_rectangle_points(x1, y1, x2, y2) {
    const points = [];
    const y_direction = y1 - y2 > 0 ? -1 : 1;
    const x_direction = x1 - x2 > 0 ? -1 : 1;
    for (let i = x1; x_direction > 0 ? i <= x2 : i >= x2; i += x_direction) {
      points.push({ x: i, y: y1 });
      points.push({ x: i, y: y2 });
    }
    for (
      let j = y1 + y_direction;
      y_direction > 0 ? j < y2 : j > y2;
      j += y_direction
    ) {
      points.push({ x: x1, y: j });
      points.push({ x: x2, y: j });
    }
    return points;
  }

  /**
   * Calculates the circle points using a midpoint circle algorithm
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Array<{x: Number, y: Number}>}
   */
  static calculate_circle_points(x1, y1, x2, y2) {
    const points = [];
    const added_points = {};
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
        points.push({ x: x, y: y });
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
   * @param {{x: Number, y: Number}} point1
   * @param {{x: Number, y: Number}} point2
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
   * @param {Array} matrix
   * @param {Function} action
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

  /**
   * Compares two color arrays or assets
   * @param {Array|String} color1
   * @param {Array|String} color2
   * @returns {Boolean}
   */
  static compare_colors(color1, color2) {
    return JSON.stringify(color1) === JSON.stringify(color2);
  }

  /**
   * Expands the given shape points according to the pixel size
   * @param {Array<{x: Number, y: Number}>} shape_points
   * @param {Number} pixel_size
   * @param {Array} matrix
   * @returns {Array<{x: Number, y: Number}>}
   */
  static expand_shape_points(shape_points, pixel_size, matrix) {
    const expanded_points = [];
    shape_points.forEach((point) => {
      EditorUtil.apply_to_pixel_block(
        point.x,
        point.y,
        pixel_size,
        matrix,
        (xi, yj) => {
          expanded_points.push({ x: xi, y: yj });
        }
      );
    });
    return expanded_points;
  }

  /**
   * Converts an array of RGB values to a hex color string
   * @param {Array<Number>} color
   * @returns {String}
   */
  static rgb_array_to_hex(color) {
    const r = color[0].toString(16).padStart(2, "0");
    const g = color[1].toString(16).padStart(2, "0");
    const b = color[2].toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  /**
   * Clamps a number between a minimum and a maximum value
   * @param {Number} value
   * @param {Number} min
   * @param {Number} max
   * @returns {Number}
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Adjusts the zoom level and ensures it stays within the defined limits.
   * @param {Boolean} zoom_up
   * @param {Number} scale
   * @param {Number} mouseX
   * @param {Number} mouseY
   * @param {Number} min_scale
   * @param {Number} max_scale
   * @returns {{new_scale: Number, deltaX: Number, deltaY: Number}}
   */
  static apply_zoom(
    zoom_up,
    scale,
    mouseX,
    mouseY,
    min_scale = 1,
    max_scale = 3
  ) {
    let new_scale = zoom_up ? scale + 0.1 : scale - 0.1;
    new_scale = Math.min(max_scale, Math.max(min_scale, new_scale));

    const deltaX = mouseX * (scale - new_scale);
    const deltaY = mouseY * (scale - new_scale);

    return { new_scale, deltaX, deltaY };
  }

  /**
   * Scrolls the canvas based on the delta values of the mouse wheel.
   * @param {Element} canvas_wrapper
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  static scroll_canvas(canvas_wrapper, deltaX, deltaY) {
    canvas_wrapper.scrollLeft += deltaX;
    canvas_wrapper.scrollTop += deltaY;
  }

  /**
   * Retrieves the mouse position relative to the canvas, adjusting for scale.
   * @param {Event} event
   * @param {Number} tile_size
   * @param {Number} scale
   * @param {Element} canvas
   * @returns {{x: Number, y: Number}}
   */
  static get_mouse_position(event, tile_size, scale, canvas) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (tile_size * scale);
    const mouseY = (event.clientY - rect.top) / (tile_size * scale);
    return { x: Math.floor(mouseX), y: Math.floor(mouseY) };
  }

  /**
   * Combines two colors
   * @param {Array<Number>} color1
   * @param {Array<Number>} color2
   * @returns {Array<Number>}
   */
  static combine_colors(color1, color2) {
    const r = Math.round((color1[0] + color2[0]) / 2);
    const g = Math.round((color1[1] + color2[1]) / 2);
    const b = Math.round((color1[2] + color2[2]) / 2);
    const a = Math.round((color1[3] + color2[3]) / 2);
    return [r, g, b, a];
  }

  /**
   * Checks if the color is transparent
   * @param {Array<Number>} color
   * @returns {Boolean}
   */
  static is_transparent(color) {
    return color[3] === 0;
  }

  /**
   * Determines whether to draw or erase based on the position for dithering
   * @param {{x: Number, y: Number}} position
   * @returns {String} "draw" or "erase"
   */
  static draw_or_erase(position) {
    const is_x_odd = position.x % 2 !== 0;
    const is_y_odd = position.y % 2 !== 0;
    if ((is_x_odd && !is_y_odd) || (!is_x_odd && is_y_odd)) {
      return "draw";
    } else {
      return "erase";
    }
  }

  /**
   * Sets the start position for selection
   * @param {Object} editorInstance
   * @param {{x: Number, y: Number}} position
   */
  static set_selection_start_point(editorInstance, position) {
    editorInstance.selection_start_point = position;
  }

  /**
   * Sets the start position for moving the selection
   * @param {Object} editorInstance
   * @param {{x: Number, y: Number}} position
   */
  static set_selection_move_start_point(editorInstance, position) {
    editorInstance.selection_move_start_point = position;
  }

  /**
   * Draws a rectangle selection
   * @param {Object} editorInstance
   * @param {{x: Number, y: Number}} position
   */
  static draw_rectangle_selection(editorInstance, position) {
    editorInstance.selected_points = [];
    const y_direction =
      editorInstance.selection_start_point.y - position.y > 0 ? -1 : 1;
    const x_direction =
      editorInstance.selection_start_point.x - position.x > 0 ? -1 : 1;
    for (
      let i = editorInstance.selection_start_point.x;
      x_direction > 0 ? i <= position.x : i >= position.x;
      i += x_direction
    ) {
      for (
        let j = editorInstance.selection_start_point.y;
        y_direction > 0 ? j <= position.y : j >= position.y;
        j += y_direction
      ) {
        editorInstance.selected_points.push({
          x: i,
          y: j,
        });
      }
    }
    editorInstance.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: editorInstance.selected_points,
        },
      })
    );
  }

  /**
   * Draws a lasso selection
   * @param {Object} editorInstance
   * @param {Array<{x: Number, y: Number}>} path
   */
  static draw_lasso_selection(editorInstance, path) {
    editorInstance.selected_points = [];

    const { x: x1_start, y: y1_start } = editorInstance.selection_start_point;
    const { x: x2_end, y: y2_end } = path[path.length - 1];

    const linePoints = EditorUtil.calculate_line_points(
      x1_start,
      y1_start,
      x2_end,
      y2_end
    );

    linePoints.forEach((point) => {
      if (
        !EditorUtil.is_point_already_selected(
          point,
          editorInstance.selected_points
        )
      ) {
        editorInstance.selected_points.push({
          x: point.x,
          y: point.y,
        });
      }
    });

    for (let i = 0; i < path.length - 1; i++) {
      const { x: x1, y: y1 } = path[i];
      const { x: x2, y: y2 } = path[i + 1];
      const linePoints = EditorUtil.calculate_line_points(x1, y1, x2, y2);

      linePoints.forEach((point) => {
        if (
          !EditorUtil.is_point_already_selected(
            point,
            editorInstance.selected_points
          )
        ) {
          editorInstance.selected_points.push({
            x: point.x,
            y: point.y,
          });
        }
      });
    }

    editorInstance.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: editorInstance.selected_points,
        },
      })
    );
  }

  /**
   * Fills the selection area
   * @param {Object} editorInstance
   * @param {Array<{x: Number, y: Number}>} pointsInsidePath
   */
  static fill_selection(editorInstance, pointsInsidePath) {
    pointsInsidePath.forEach((point) => {
      if (
        !EditorUtil.is_point_already_selected(
          point,
          editorInstance.selected_points
        )
      ) {
        editorInstance.selected_points.push({
          x: point.x,
          y: point.y,
        });
      }
    });
    editorInstance.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: editorInstance.selected_points,
        },
      })
    );
  }

  /**
   * Moves the selected area
   * @param {Object} editorInstance
   * @param {{x: Number, y: Number}} position
   */
  static move_selected_area(editorInstance, position) {
    const start_point = editorInstance.selection_move_start_point;
    const difference = EditorUtil.calculate_move_difference(
      start_point,
      position
    );
    editorInstance.selected_points = editorInstance.selected_points.map(
      (point) => {
        const x = point.x - difference.x;
        const y = point.y - difference.y;
        return {
          ...point,
          x: x,
          y: y,
        };
      }
    );
    editorInstance.selection_move_start_point = position;
    editorInstance.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: editorInstance.selected_points,
        },
      })
    );
  }

  /**
   * Compares two values (colors or assets)
   * @param {*} value1
   * @param {*} value2
   * @returns {Boolean}
   */
  static compare_values(value1, value2) {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }

  /**
   * Performs shape selection
   * @param {Object} editorInstance
   * @param {Number} x
   * @param {Number} y
   */
  static shape_selection(editorInstance, x, y) {
    const content = editorInstance.get_content();
    const target_value = content[x][y];
    const queue = [{ x, y }];
    const visited = {};

    editorInstance.selected_points = [];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const key = `${x}_${y}`;

      if (
        !visited[key] &&
        x >= 0 &&
        x < editorInstance.width &&
        y >= 0 &&
        y < editorInstance.height &&
        EditorUtil.compare_values(content[x][y], target_value)
      ) {
        visited[key] = true;
        editorInstance.selected_points.push({
          x,
          y,
        });
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
    editorInstance.dispatchEvent(
      new CustomEvent("update_selected_area", {
        detail: {
          points: editorInstance.selected_points,
        },
      })
    );
  }

  /**
   * Destroys the selection
   * @param {Object} editorInstance
   */
  static destroy_selection(editorInstance) {
    editorInstance.selection_copied = false;
    editorInstance.selected_points = [];
    editorInstance.dispatchEvent(new CustomEvent("remove_selection"));
  }
}
