import { SpriteFrames } from "./SpriteFrames.js";
import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpritePreview extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
    this.appendChild(new SpriteFrames(sprite_editor));
  }

  render() {
    return ``;
  }

  init() {}
}

customElements.define("sprite-preview", SpritePreview);
