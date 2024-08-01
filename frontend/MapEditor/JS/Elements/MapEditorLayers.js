import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
        <p>Layers</p>
        <div class="placeholder-layers-box"></div>
      `;
  }

  init() {}
}

customElements.define("map-editor-layers", MapEditorLayers);
