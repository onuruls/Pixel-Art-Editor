import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpritePreview extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    return `
        <p>PreView</p>
      `;
  }

  init() {}
}

customElements.define("sprite-preview", SpritePreview);
