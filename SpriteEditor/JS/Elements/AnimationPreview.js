import { AnimationPreviewControls } from "./AnimationPreviewControls.js";
import { SpriteFrames } from "./SpriteFrames.js";

export class AnimationPreview extends HTMLElement {
  /**
   *
   * @param {SpriteFrames} sprite_frames
   */
  constructor(sprite_frames) {
    super();
    this.sprite_frames = sprite_frames;
    this.animation_img = this.create_animation_img();
    this.controls = new AnimationPreviewControls(this);
    this.frame_index = 0;
    this.last_frame_time = 0;
    this.frame_duration = 1000 / this.controls.fps_count;
    this.init();
  }

  /**
   * The img that displays the animation
   * @returns {HTMLElement}
   */
  create_animation_img() {
    const img = document.createElement("img");
    img.setAttribute("id", "animation_img");
    return img;
  }

  /**
   * initialized element
   */
  init() {
    this.appendChild(this.animation_img);
    this.appendChild(this.controls);
    requestAnimationFrame(this.animation_loop.bind(this));
  }

  /**
   * Animation loop always running, but only animated
   * when play is toggled. Stops when Element is not connected to DOM
   * @param {Number} timestamp
   */
  animation_loop(timestamp) {
    if (
      timestamp - this.last_frame_time > this.frame_duration &&
      this.controls.is_playing
    ) {
      this.frame_index =
        (this.frame_index + 1) % this.sprite_frames.frames.length;
      this.animation_img.setAttribute(
        "src",
        this.sprite_frames.frames[this.frame_index].thumbnail.src
      );
      this.last_frame_time = timestamp;
    }
    if (this.isConnected) {
      requestAnimationFrame(this.animation_loop.bind(this));
    }
  }
}

customElements.define("animation-preview", AnimationPreview);
