import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorPreview extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  render() {
    return `
        <p>PreView</p>
      `;
  }

  init() {}
}

customElements.define("map-editor-preview", MapEditorPreview);
