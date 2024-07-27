import { Frame } from "./Frame.js";
import { SpriteEditor } from "./SpriteEditor.js";

export class SpriteFrames extends HTMLElement {
  /**
   *
   * @param {SpriteEditor} sprite_editor
   */
  constructor(sprite_editor) {
    super();
    this.sprite_editor = sprite_editor;
    this.frame_container = this.create_frame_container();
    this.new_frame_container = this.create_new_frame_container();
    this.frames = this.create_frame_array();
    this.selected_frame = this.frames[0];
    this.selected_frame.hide_delete_label();
    this.init();
  }

  /**
   *
   * @returns {HTMLDivElement}
   */
  create_frame_container() {
    const frame_container = document.createElement("div");
    frame_container.classList.add("frame_container");
    return frame_container;
  }

  /**
   *
   * @returns {HTMLDivElement}
   */
  create_new_frame_container() {
    const new_frame_container = document.createElement("div");
    new_frame_container.classList.add("new_frame_container");
    new_frame_container.appendChild(document.createTextNode("Add Frame"));
    return new_frame_container;
  }

  /**
   *
   * @returns {Array<Frame>}
   */
  create_frame_array() {
    return [new Frame(this, 0)];
  }

  init() {
    this.appendChild(this.frame_container);
    this.appendChild(this.new_frame_container);
    this.frames.forEach((frame) => {
      frame.classList.add("selected");
      this.frame_container.appendChild(frame);
    });
    this.new_frame_container.addEventListener(
      "click",
      this.add_new_frame.bind(this)
    );
    this.sprite_editor.addEventListener(
      "update_frame_thumbnail",
      this.update_frame_img.bind(this)
    );
  }

  /**
   * Adds a new Frame to the Array
   */
  add_new_frame() {
    const frame = new Frame(this, this.frames.length);
    this.frames.push(frame);
    this.frame_container.appendChild(frame);
    this.sprite_editor.add_matrix();
    this.switch_active_frame(this.frames.length - 1);
    this.update_frame_information();
  }

  /**
   * Removes a frame on the index position
   * @param {Number} index
   */
  remove_frame(index) {
    const [frame] = this.frames.splice(index, 1);
    this.sprite_editor.remove_matrix(index);
    frame.remove();
    this.update_frame_information();
    try {
      this.switch_active_frame(index - 1);
    } catch (error) {
      this.switch_active_frame(index);
    }
  }

  /**
   * Updates information for each frame
   */
  update_frame_information() {
    this.frames.forEach((frame, frame_index) =>
      frame.update_frame_information(frame_index, this.frames.length)
    );
  }

  /**
   * Called from Frame-Element when Frame is clicked
   * @param {Number} index
   */
  switch_active_frame(index) {
    this.frames.forEach((frame) => frame.classList.remove("selected"));
    this.frames[index].classList.add("selected");
    this.selected_frame = this.frames[index];
    this.sprite_editor.switch_active_matrix(index);
  }

  /**
   *
   * @param {Event} event
   */
  update_frame_img(event) {
    const img_url = event.detail.img_url;
    console.log(img_url);
    this.selected_frame.update_thumbnail(img_url);
  }

  /**
   * from HTMLElement
   * called when removed to DOM
   */
  disconnnectedCallback() {
    this.new_frame_container.removeEventListener(
      "click",
      this.add_new_frame.bind(this)
    );
    this.sprite_editor.removeEventListener(
      "update_frame_thumbnail",
      this.update_frame_img.bind(this)
    );
  }
}

customElements.define("sprite-frames", SpriteFrames);
