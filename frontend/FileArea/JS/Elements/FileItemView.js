import { FileAreaView } from "./FileAreaView.js";
import { ItemView } from "./ItemView.js";
import { ColorUtil } from "../../../Util/ColorUtil.js";

/**
 * View-Class of a File in the FileAreaView.
 * Extends the base ItemView class to customize behavior for files.
 */
export class FileItemView extends ItemView {
  /**
   * @param {String} name
   * @param {FileAreaView} file_area_view
   * @param {Number} id
   * @param {String} type
   */
  constructor(name, file_area_view, id, type) {
    super(name, file_area_view, id);
    this.id = id;
    this.type = type;
    this.file_area_view = file_area_view;
    this.file_area = this.file_area_view.file_area;
    this.setAttribute("draggable", true);
    this.edit_name_input = this.create_edit_name_input();
    this.update_name_field();
    this.init();
  }

  /**
   * Creates an icon for the file based on its type.
   * @returns {HTMLElement}
   */
  create_icon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file");
    return icon;
  }

  /**
   * Initializes the file item view with custom event listeners
   */
  init() {
    super.init();
    this.icon.addEventListener("dblclick", async () => {
      if (this.file_area.file_system_handler) {
        await this.file_area.open_file(this.id);
      } else {
        console.error("File system handler is not ready.");
      }
    });
    if (this.type === "png") {
      this.addEventListener("mouseenter", this.show_sprite_preview.bind(this));
      this.addEventListener("mouseleave", this.hide_sprite_preview.bind(this));
    }
  }

  /**
   * Adds the file extension to the name for display purposes.
   */
  update_name_field() {
    this.name_field.textContent = `${this.name}.${this.type}`;
  }

  /**
   * Creates an input field for editing the file name, excluding the extension.
   * @returns {HTMLInputElement}
   */
  create_edit_name_input() {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.classList.add("edit-name-input");
    input.value = this.name;
    return input;
  }

  /**
   * Replaces the name field with an input field for renaming.
   * The file extension is not editable.
   */
  replace_name_with_input() {
    this.replaceChild(this.edit_name_input, this.name_field);
    this.edit_name_input.addEventListener("blur", () => {
      this.name = this.edit_name_input.value;
      this.update_name_field();
    });
  }

  /**
   * Shows a small preview of the sprite (png) file when hovered.
   */
  show_sprite_preview() {
    const preview = document.createElement("img");
    const file = this.file_area.file_system_handler.get_file_by_id(this.id);
    const url = ColorUtil.matrix_to_img_url(file.data.frames[0].matrix);
    preview.src = url;
    preview.classList.add("sprite-file-preview");
    preview.style.pointerEvents = "none";
    this.appendChild(preview);

    this.previewElement = preview;
  }

  /**
   * Hides the sprite preview when the mouse leaves.
   */
  hide_sprite_preview() {
    if (this.previewElement) {
      this.removeChild(this.previewElement);
      this.previewElement = null;
    }
  }
}

customElements.define("file-item", FileItemView);
