import { FileArea } from "./FileArea.js";

export class FileAreaTools extends HTMLElement {
  /**
   * Toolbar in FileArea
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.classList.add("file-area-tools");
    this.file_area = file_area;
    this.settings_button = this.create_settings_button();
    this.save_button = this.create_save_button();
    this.import_button = this.create_import_button();
    this.export_button = this.create_export_button();
    this.appendChild(this.settings_button);
    this.appendChild(this.save_button);
    this.appendChild(this.import_button);
    this.appendChild(this.export_button);
    this.init();
  }

  /**
   * Creates the "Settings" button
   * @returns {HTMLButtonElement}
   */
  create_settings_button() {
    const settings_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-gear", "fa-fw");
    icon.setAttribute("alt", "Settings");
    settings_button.setAttribute("id", "settings");
    settings_button.appendChild(icon);
    settings_button.appendChild(document.createTextNode("Settings"));
    return settings_button;
  }

  /**
   * Creates the "Save" button
   * @returns {HTMLButtonElement}
   */
  create_save_button() {
    const save_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-floppy-disk", "fa-fw");
    icon.setAttribute("alt", "Save");
    save_button.setAttribute("id", "resize");
    save_button.appendChild(icon);
    save_button.appendChild(document.createTextNode("Save"));
    return save_button;
  }

  /**
   * Creates the "Import" button
   * @returns {HTMLButtonElement}
   */
  create_import_button() {
    const import_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file-import", "fa-fw");
    icon.setAttribute("alt", "Import");
    import_button.setAttribute("id", "import");
    import_button.appendChild(icon);
    import_button.appendChild(document.createTextNode("Import"));
    return import_button;
  }

  /**
   * Creates the "Export" button
   * @returns {HTMLButtonElement}
   */
  create_export_button() {
    const export_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-file-export", "fa-fw");
    icon.setAttribute("alt", "Export");
    export_button.setAttribute("id", "export");
    export_button.appendChild(icon);
    export_button.appendChild(document.createTextNode("Export"));
    return export_button;
  }

  /**
   * Initializes the tool listeners
   */
  init() {
    this.export_button.addEventListener("click", () => {
      this.file_area.editor_tool.sprite_editor.export_as_png();
    });
    this.import_button.addEventListener("click", () => {
      this.file_area.editor_tool.sprite_editor.import_clicked();
    });
  }
}

customElements.define("file-area-tools-right", FileAreaTools);
