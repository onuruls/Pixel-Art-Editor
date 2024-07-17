import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
      <h1 id="title">Map Editor</h1>
      <div class="toolbox">
        <p>Tools Placeolder</p>
      </div>
      <div class="assetbox">
        <p>Asset Placeolder</p>
      </div>
    `;
  }

  init() {}
}

customElements.define("map-editor-tools", MapEditorTools);
