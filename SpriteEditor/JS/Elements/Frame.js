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
    this.thumbnail = this.create_thumbnail();
    this.label = this.create_label();
    this.delete_label = this.create_delete_label();
    this.thumbnail_wrapper = this.create_thumbnail_wrapper();
    this.init();
  }

  /**
   *
   * @returns {HTMLImageElement}
   */
  create_thumbnail() {
    const thumbnail = document.createElement("img");
    return thumbnail;
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
  create_thumbnail_wrapper() {
    const thumbnail_wrapper = document.createElement("div");
    thumbnail_wrapper.classList.add("thumbnail_wrapper");
    return thumbnail_wrapper;
  }

  init() {
    this.thumbnail_wrapper.appendChild(this.thumbnail);
    this.appendChild(this.thumbnail_wrapper);
    this.appendChild(this.label);
    this.appendChild(this.delete_label);
    this.addEventListener("click", this.frame_clicked);
    this.delete_label.addEventListener("click", this.delete_clicked.bind(this));
  }

  /**
   * Triggered when frame is clicked
   * @param {Event} event
   */
  frame_clicked(event) {
    this.sprite_frames.switch_active_frame(this.index);
  }

  /**
   * Triggered when a delete label is clicked
   * @param {Event} event
   */
  delete_clicked(event) {
    this.sprite_frames.remove_frame(this.index);
  }

  /**
   * Informs the frame on his index and the total frame count
   * @param {Number} index
   */
  update_frame_information(index, frame_count) {
    if (frame_count === 1) {
      this.hide_delete_label();
    } else {
      this.show_delete_label();
    }
    this.index = index;
    this.label.textContent = `${index}`;
  }

  /**
   * Called from parent class
   * updates the small thumbnail
   * @param {URL} img_url
   */
  update_thumbnail(img_url) {
    this.thumbnail.src = img_url;
  }

  /**
   * Hides the delete label
   */
  hide_delete_label() {
    this.delete_label.classList.add("hidden");
  }

  /**
   * Shows the delete label
   */
  show_delete_label() {
    this.delete_label.classList.remove("hidden");
  }

  /**
   * Removes all listeners before removing element from DOM
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.frame_clicked);
    this.delete_label.removeEventListener(
      "click",
      this.delete_clicked.bind(this)
    );
  }
}

customElements.define("sprite-frame", Frame);
