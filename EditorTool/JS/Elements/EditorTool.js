import { SpriteEditor } from "../../../SpriteEditor/JS/Elements/SpriteEditor.js";
import { FileArea } from "../../../FileArea/JS/Elements/FileArea.js";
import { MapEditor } from "../../../MapEditor/JS/Elements/MapEditor.js";
export class EditorTool extends HTMLElement {
  constructor() {
    super();
    this.sprite_editor = new SpriteEditor(this);
    this.map_editor = new MapEditor(this);
    this.file_area = new FileArea(this);
  }

  connectedCallback() {
    this.css = document.createElement("link");
    this.css.setAttribute("href", "../EditorTool/CSS/Elements/EditorTool.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");

    this.editor_container = document.createElement("div");
    this.editor_container.setAttribute("id", "editor_container");
    this.editor_container.appendChild(this.sprite_editor);
    this.appendChild(this.css);
    this.appendChild(this.editor_container);
    this.appendChild(this.file_area);
  }

  /**
   * Changes Sprite- and MapEditor
   */
  change_editor() {
    if (this.sprite_editor.parentNode) {
      this.sprite_editor.remove();
      this.editor_container.appendChild(this.map_editor);
    } else {
      this.map_editor.remove();
      this.editor_container.appendChild(this.sprite_editor);
    }
  }
}

customElements.define("editor-tool", EditorTool);
