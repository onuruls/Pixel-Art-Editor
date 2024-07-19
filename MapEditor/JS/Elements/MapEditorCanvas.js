import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorCanvas extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
        <div class="canvas-wrapper">
          <canvas id="drawing_canvas"></canvas>
        </div>
      `;
  }

  init() {}
}

customElements.define("map-editor-canvas", MapEditorCanvas);
