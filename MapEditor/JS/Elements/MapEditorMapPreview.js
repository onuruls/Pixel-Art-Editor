import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorMapPreview extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
        <p>Map - Preview</p>
        <div class="placeholder-map-preview-box"></div>
      `;
  }

  init() {}
}

customElements.define("map-editor-map-preview", MapEditorMapPreview);
