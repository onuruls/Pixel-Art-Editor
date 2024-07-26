import { SpriteEditor } from "./SpriteEditor.js";
import { SpriteFrames } from "./SpriteFrames.js";

export class Frame extends HTMLElement {
  /**
   *
   * @param {SpriteFrames} sprite_frames
   */
  constructor(sprite_frames, index) {
    super();
    this.sprite_frames = sprite_frames;
    this.index = index;
    this.canvas = this.create_canvas();
    this.label = this.create_label();
    this.delete_label = this.create_delete_label();
    this.canvas_wrapper = this.create_canvas_wrapper();
    this.init();
  }

  /**
   *
   * @returns {HTMLCanvasElement}
   */
  create_canvas() {
    const canvas = document.createElement("canvas");
    canvas.classList.add("frame_canvas");
    return canvas;
  }

  /**
   * Creates the delete label for the bottom right corner
   * @returns {HTMLDivElement}
   */
  create_delete_label() {
    const delete_label = document.createElement("div");
    delete_label.classList.add("delete_label");
    delete_label.appendChild(document.createTextNode("X"));
    return delete_label;
  }

  /**
   * Creates the label for the top left corner
   * @returns {HTMLDivElement}
   */
  create_label() {
    const label = document.createElement("div");
    label.classList.add("index_label");
    label.appendChild(document.createTextNode(this.index));
    return label;
  }

  /**
   * Creates the wrapper div for the canvas
   * @returns
   */
  create_canvas_wrapper() {
    const canvas_wraper = document.createElement("div");
    canvas_wraper.classList.add("canvas_wrapper");
    return canvas_wraper;
  }

  init() {
    this.canvas_wrapper.appendChild(this.canvas);
    this.appendChild(this.canvas_wrapper);
    this.appendChild(this.label);
    this.appendChild(this.delete_label);
    this.addEventListener("click", this.frame_clicked);
    this.delete_label.addEventListener("click", this.delete_clicked.bind(this));
  }

  frame_clicked(event) {
    this.sprite_frames.switch_active_frame(this.index);
  }

  delete_clicked(event) {
    this.sprite_frames.delete_frame(this.index);
  }

  /**
   *
   * @param {Number} index
   */
  update_index(index) {
    this.index = index;
    this.label.textContent = `${index}`;
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.frame_clicked);
    this.delete_label.removeEventListener(
      "click",
      this.delete_clicked.bind(this)
    );
  }
}

customElements.define("sprite-frame", Frame);
