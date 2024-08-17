export class layer {
  /**
   * Abstract Layer class
   * @param {string} name
   */
  constructor(name) {
    if (new.target === layer) {
      throw new TypeError("Cannot construct layer instances directly");
    }
    this.name = name;
    this.visible = true;
  }

  /**
   * Render the layer on the provided canvas context
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    throw new Error("Render method must be implemented by subclass");
  }

  /**
   * Toggle visibility of the layer
   */
  toggle_visibility() {
    this.visible = !this.visible;
  }
}
