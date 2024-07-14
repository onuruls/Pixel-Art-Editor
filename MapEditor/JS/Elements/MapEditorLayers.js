import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  render() {
    return `
        <p>Layers</p>
      `;
  }

  init() {}
}

customElements.define("map-editor-layers", MapEditorLayers);
