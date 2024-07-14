import { SelectionTool } from "./SelectionTool.js";

/**
 * Represents an irregular selection tool that extends SelectionTool.
 * Allows drawing irregular selections on a canvas.
 */
export class IrregularSelection extends SelectionTool {
  /**
   * Constructs an instance of IrregularSelection.
   * @param {HTMLCanvasElement} canvas - The canvas element to work on.
   */
  constructor(canvas) {
    super(canvas);
    this.canvas.style.cursor = `crosshair`;
    this.path = [];
    this.is_drawing = false;
    this.is_moving = false;
    this.has_moved = false;
  }

  /**
   * Handles mouse down event.
   * Initiates drawing or moving of the selection.
   * @param {MouseEvent} event - The mouse event.
   */
  mouse_down(event) {
    if (!this.mouse_over_selected_area(event)) {
      if (this.path.length > 0) {
        this.path = [];
      }
      this.pending_drawing = true;
      const position = this.get_mouse_position(event);
      this.path = [position];
      this.sprite_editor.set_selection_start_point(position);
      this.draw(event);

    } else {
      this.sprite_editor.set_selection_move_start_point(this.get_mouse_position(event));
      this.is_moving = true;
    }
  }

  /**
   * Handles mouse move event.
   * Updates drawing or moving of the selection.
   * @param {MouseEvent} event - The mouse event.
   */
  mouse_move(event) {
    if (this.is_moving) {
      this.move(event);
      this.has_moved = true;
      return;
    } 
    if (this.pending_drawing) {
      this.is_drawing = true;
      this.pending_drawing = false;
      this.add_point_to_path(event);
      this.draw(event);
      return;
    } 
    if (this.is_drawing) {
      this.add_point_to_path(event);
      this.draw(event);
    }
  }

  /**
   * Handles mouse up event.
   * Finalizes drawing or moving of the selection.
   * @param {MouseEvent} event - The mouse event.
   */
  mouse_up(event) {
    if (this.is_moving) {
      this.is_moving = false;
      this.has_moved = false;
      return;
    } 
    if (this.is_drawing) {
      this.is_drawing = false;
      // Also capture the complete stroke from the start to the end by using the selected points.
      this.path = this.sprite_editor.selected_points;
      const selectedPoints = this.find_points_inside_path();
      this.path.concat(selectedPoints);
      this.sprite_editor.fill_selection(selectedPoints);
      return;
    } 
    if (this.pending_drawing) {
      this.pending_drawing = false;
      this.path = [];
    }
  }

  /**
   * Adds a point to the current selection path.
   * @param {MouseEvent} event - The mouse event.
   */
  add_point_to_path(event) {
    const position = this.get_mouse_position(event);
    this.path.push(position);
  }

  /**
   * Draws the current selection on the canvas.
   * @param {MouseEvent} event - The mouse event.
   */
  draw(event) {
    this.sprite_editor.draw_lasso_selection(this.path);
  }

  /**
   * Moves the current selection on the canvas.
   * @param {MouseEvent} event - The mouse event.
   */
  move(event) {
    const position = this.get_mouse_position(event);
    if (!this.compare_points(position, this.last_move_position)) {
      this.sprite_editor.move_selected_area(position);
      this.last_move_position = position;
    }
  }

  /**
   * Finds points inside the current selection path.
   * @returns {Array<{x: Number, y: Number}>} - Array of points inside the path.
   */
  find_points_inside_path() {
    const maxX = Math.max(...this.path.map((p) => p.x));
    const minX = Math.min(...this.path.map((p) => p.x));
    const maxY = Math.max(...this.path.map((p) => p.y));
    const minY = Math.min(...this.path.map((p) => p.y));

    const pointsInside = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (this.is_point_inside_path({ x, y })) {
          pointsInside.push({ x, y });
        }
      }
    }
    return pointsInside;
  }

  /**
 * Checks if a point is inside the path defined by this.path using the ray-casting algorithm.
 * @param {{ x: number, y: number }} point - The point to check
 * @returns {boolean} True if the point is inside the path, false otherwise
 */
is_point_inside_path(point) {
    const px = point.x;
    const py = point.y;
    let inside = false;
  
    // Iterate through each edge of the path
    for (let i = 0, j = this.path.length - 1; i < this.path.length; j = i++) {
      const pxi = this.path[i].x;
      const pyi = this.path[i].y;
      const pxj = this.path[j].x;
      const pyj = this.path[j].y;
  
      // Check if the point is to the left of the edge and intersects with it
      const is_above = (pyi > py) !== (pyj > py);
      const is_left_of_edge = px < (pxj - pxi) * (py - pyi) / (pyj - pyi) + pxi;
  
      // Toggle the inside flag if the point crosses the edge
      if (is_above && is_left_of_edge) {
        inside = !inside;
      }
    }
  
    return inside;
  }
  

}
