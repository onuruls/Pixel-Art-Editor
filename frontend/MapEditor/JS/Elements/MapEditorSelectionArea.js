import { MapEditorPart } from "./MapEditorPart.js";
import { MapEditorMapPreview } from "./MapEditorMapPreview.js";
import { MapEditorSpritePreview } from "./MapEditorSpriteView.js";
import { MapEditorLayers } from "./MapEditorLayers.js";

export class MapEditorSelectionArea extends MapEditorPart {
  /**
   *
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.layer_updated_bind = this.layer_updated.bind(this);
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
    this.append(this.map_sprite_preview, this.map_layers, this.map_map_preview);

    this.map_editor.addEventListener("layers-updated", this.layer_updated_bind);
    this.map_layers.render_layers_list(
      this.map_editor.layers,
      this.map_editor.active_layer_index
    );
  }

  disconnectedCallback() {
    this.map_editor.removeEventListener(
      "layers-updated",
      this.layer_updated_bind
    );
  }

  layer_updated() {
    this.map_layers.render_layers_list(
      this.map_editor.layers,
      this.map_editor.active_layer_index
    );
  }
}

customElements.define("map-editor-selection-area", MapEditorSelectionArea);
