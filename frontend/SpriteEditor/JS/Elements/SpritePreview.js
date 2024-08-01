import { SpriteFrames } from "./SpriteFrames.js";
import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { AnimationPreview } from "./AnimationPreview.js";

export class SpritePreview extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
    this.sprite_frames = new SpriteFrames(sprite_editor);
    this.preview = new AnimationPreview(this.sprite_frames);
  }

  render() {
    return ``;
  }

  /**
   * initializes the element
   */
  init() {
    this.appendChild(this.preview);
    this.appendChild(this.sprite_frames);
  }
}

customElements.define("sprite-preview", SpritePreview);
