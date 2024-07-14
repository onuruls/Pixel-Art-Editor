import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorCanvas extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  render() {
    return `
        <p>Canvas<p>
      `;
  }

  init() {}
}

customElements.define("map-editor-canvas", MapEditorCanvas);
