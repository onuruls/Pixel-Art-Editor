import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { MapEditorCanvas } from "./MapEditorCanvas.js";
import { MapEditorLayers } from "./MapEditorLayers.js";
import { MapEditorPreview } from "./MapEditorPreview.js";
import { MapEditorSpritePreview } from "./MapEditorSpriteView.js";
import { MapEditorTools } from "./MapEditorTools.js";

export class MapEditor extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;

    this.css = document.createElement("link");
    this.css.setAttribute("href", "../MapEditor/CSS/Elements/MapEditor.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.map_canvas = new MapEditorCanvas(this);
    this.map_layers = new MapEditorLayers(this);
    this.map_preview = new MapEditorPreview(this);
    this.map_sprite_preview = new MapEditorSpritePreview(this);
    this.map_tools = new MapEditorTools(this);
    this.appendChild(this.map_canvas);
    this.appendChild(this.map_layers);
    this.appendChild(this.map_preview);
    this.appendChild(this.map_sprite_preview);
    this.appendChild(this.map_tools);
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
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
