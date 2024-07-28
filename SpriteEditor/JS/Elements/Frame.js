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
    this.label = this.create_index_label();
    this.delete_label = this.create_delete_label();
    this.copy_label = this.create_copy_label();
    this.move_label = this.create_move_label();
    this.thumbnail_wrapper = this.create_thumbnail_wrapper();
    this.dragging = false;
    this.drag_start_y = NaN;
    this.drag_start_top = NaN;
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
   * @returns {HTMLLabelElement}
   */
  create_delete_label() {
    const delete_label = document.createElement("label");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash");
    delete_label.classList.add("delete_label");
    delete_label.appendChild(icon);
    return delete_label;
  }

  /**
   * Creates the copy label for the bottom left corner
   * @returns {HTMLLabelElement}
   */
  create_copy_label() {
    const copy_label = document.createElement("label");
    const icon = document.createElement("i");
    icon.classList.add("fa-regular", "fa-copy");
    copy_label.classList.add("copy_label");
    copy_label.appendChild(icon);
    return copy_label;
  }

  /**
   * Creates the move label for the bottom left corner
   * @returns {HTMLLabelElement}
   */
  create_move_label() {
    const move_label = document.createElement("label");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-arrows-up-down-left-right");
    move_label.classList.add("move_label");
    move_label.appendChild(icon);
    return move_label;
  }

  /**
   * Creates the label for the top left corner
   * @returns {HTMLLabelElement}
   */
  create_index_label() {
    const label = document.createElement("label");
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
    this.appendChild(this.copy_label);
    this.appendChild(this.move_label);
    this.thumbnail.addEventListener("click", this.frame_clicked.bind(this));
    this.delete_label.addEventListener("click", this.delete_clicked.bind(this));
    this.copy_label.addEventListener("click", this.copy_clicked.bind(this));
    this.move_label.addEventListener("mousedown", this.drag_start.bind(this));
    document.addEventListener("mousemove", this.drag_move.bind(this));
    document.addEventListener("mouseup", this.drag_end.bind(this));
    // this.addEventListener("dragstart", () => console.log("dragstart"));
  }

  /**
   * Triggered when frame is clicked
   * @param {Event} event
   */
  frame_clicked(event) {
    this.sprite_frames.switch_active_frame(this.index);
  }

  /**
   * Triggered when the delete label is clicked
   * @param {Event} event
   */
  delete_clicked(event) {
    this.sprite_frames.remove_frame(this.index);
  }
  /**
   * Triggered when the copy label is clicked
   * @param {Event} event
   */
  copy_clicked(event) {
    this.sprite_frames.copy_frame(this.index);
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
   * Called when dragging starts
   * @param {Event} event
   */
  drag_start(event) {
    this.dragging = true;
    this.drag_start_y = event.clientY;
    this.drag_start_top = this.getBoundingClientRect().top;
    this.sprite_frames.drag_started(this.index);
  }

  /**
   * Called while dragging
   * @param {Event} event
   */
  drag_move(event) {
    if (this.dragging) {
      const y_diff = event.clientY - this.drag_start_y;
      this.style.top = `${this.drag_start_top + y_diff}px`;
      this.sprite_frames.drag_move();
    }
  }

  /**
   * Called when drag ends
   * @param {Event} event
   */
  drag_end(event) {
    if (this.dragging) {
      this.dragging = false;
      this.sprite_frames.drag_end();
    }
  }

  /**
   * Removes all listeners before removing element from DOM
   */
  disconnectedCallback() {
    this.thumbnail.removeEventListener("click", this.frame_clicked);
    this.delete_label.removeEventListener(
      "click",
      this.delete_clicked.bind(this)
    );
    this.copy_label.removeEventListener("click", this.copy_clicked.bind(this));
  }
}

customElements.define("sprite-frame", Frame);
