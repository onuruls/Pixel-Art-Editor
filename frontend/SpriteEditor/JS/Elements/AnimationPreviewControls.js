import { AnimationPreview } from "./AnimationPreview.js";

export class AnimationPreviewControls extends HTMLElement {
  /**
   *
   * @param {AnimationPreview} animation_preview
   */
  constructor(animation_preview) {
    super();
    this.animation_preview = animation_preview;
    this.play_button = this.create_play_button();
    this.fps_input = this.create_fps_input();
    this.fps_count = 11;
    this.is_playing = false;
    this.init();
  }

  /**
   * Button to start animation preview
   * @returns {HTMLButtonElement}
   */
  create_play_button() {
    const button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-play");
    button.setAttribute("id", "play_button");
    button.appendChild(icon);
    return button;
  }

  /**
   * Input to handle the fps for animation
   * @returns {HTMLInputElement}
   */
  create_fps_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "range");
    input.setAttribute("min", 0);
    input.setAttribute("max", 22);
    input.setAttribute("value", 11);
    input.setAttribute("id", "fps_input");
    return input;
  }

  /**
   * initializes the element
   */
  init() {
    this.appendChild(this.play_button);
    this.appendChild(this.fps_input);
    this.play_button.addEventListener("click", this.play_clicked.bind(this));
    this.fps_input.addEventListener(
      "change",
      this.fps_input_changed.bind(this)
    );
  }

  /**
   * Called when play button is clicked
   * @param {Event} event
   */
  play_clicked(event) {
    this.is_playing = !this.is_playing;
    if (this.is_playing) {
      this.play_button.classList.add("running");
    } else {
      this.play_button.classList.remove("running");
    }
  }

  /**
   *
   * @param {Event} event
   */
  fps_input_changed(event) {
    this.fps_count = event.target.value;
    this.animation_preview.frame_duration = 1000 / this.fps_count;
  }

  disconnectedCallback() {
    this.play_button.removeEventListener("click", this.play_clicked.bind(this));
    this.fps_input.removeEventListener(
      "change",
      this.fps_input_changed.bind(this)
    );
  }
}

customElements.define("animation-preview-controls", AnimationPreviewControls);
