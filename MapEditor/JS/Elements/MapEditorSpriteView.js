import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorSpritePreview extends MapEditorPart {
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
        <p>Sprite - Preview</p>
        <div class="placeholder-sprite-preview-box"></div>
      `;
  }

  init() {}
}

customElements.define("map-editor-sprite-preview", MapEditorSpritePreview);
