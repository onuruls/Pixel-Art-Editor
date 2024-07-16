import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorLayers } from "./MapEditorLayers.js";
import { MapEditorMapPreview } from "./MapEditorMapPreview.js";
import { MapEditorSpritePreview } from "./MapEditorSpriteView.js";
import { MapEditorTools } from "./MapEditorTools.js";
import { MapEditorSelectionArea } from "./MapEditorSelectionArea.js";

export class MapEditor extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.css = document.createElement("link");
    this.css.setAttribute("href", "../MapEditor/CSS/Elements/MapEditor.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.map_tools = new MapEditorTools(this);
    this.map_canvas = new MapEditorCanvas(this);
    this.map_selection_area = new MapEditorSelectionArea(this);
    this.map_layers = new MapEditorLayers(this);
    this.map_map_preview = new MapEditorMapPreview(this);
    this.map_sprite_preview = new MapEditorSpritePreview(this);
    this.appendChild(this.map_tools);
    this.appendChild(this.map_canvas);
    this.appendChild(this.map_selection_area);
    this.set_listeners();
  }

  /**
   * From HTMLElement - called when unmounted from DOM
   */
  disconnectedCallback() {}

  /**
   * inits all EventListeners
   */
  set_listeners() {
    console.log("init Event Listeners");
  }
}

customElements.define("map-editor", MapEditor);
