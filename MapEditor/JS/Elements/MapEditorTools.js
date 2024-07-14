import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  render() {
    return `
        <p>Tools</p>
      `;
  }

  init() {}
}

customElements.define("map-editor-tools", MapEditorTools);
