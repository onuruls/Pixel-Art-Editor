import { MapEditorPart } from "./MapEditorPart.js";
import { MapEditorMapPreview } from "./MapEditorMapPreview.js";
import { MapEditorSpritePreview } from "./MapEditorSpriteView.js";
import { MapEditorLayers } from "./MapEditorLayers.js";

export class MapEditorSelectionArea extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `Selection Area`;
  }

  init() {
    this.map_sprite_preview = new MapEditorSpritePreview(this.map_editor);
    this.map_map_preview = new MapEditorMapPreview(this.map_editor);
    this.map_layers = new MapEditorLayers(this.map_editor);
    this.appendChild(this.map_sprite_preview);
    this.appendChild(this.map_map_preview);
    this.appendChild(this.map_layers);

  }
}

customElements.define("map-editor-selection-area", MapEditorSelectionArea);
