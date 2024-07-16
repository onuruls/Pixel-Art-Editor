import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorSpritePreview extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  render() {
    return `
        <p>Sprite - PreView</p>
      `;
  }

  init() {}
}

customElements.define("map-editor-sprite-preview", MapEditorSpritePreview);
