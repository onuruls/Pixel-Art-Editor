import { FileArea } from "./FileArea.js";

export class FileAreaToolsRight extends HTMLElement {
  /**
   *
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
    this.css = this.create_css_link();
    this.settings_button = this.create_settings_button();
    this.save_button = this.create_save_button();
    this.import_button = this.create_import_button();
    this.export_button = this.create_export_button();
    this.appendChild(this.css);
    this.appendChild(this.settings_button);
    this.appendChild(this.save_button);
    this.appendChild(this.import_button);
    this.appendChild(this.export_button);
    this.init();
  }

  /**
   *
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", `../FileArea/CSS/Elements/FileAreaToolsRight.css`);
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   * Erzeugt den "Settings"-Button.
   * @returns {HTMLButtonElement}
   */
  create_settings_button() {
    const settings_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/settings.svg");
    img.setAttribute("alt", "Settings");
    settings_button.setAttribute("id", "settings");
    settings_button.appendChild(img);
    settings_button.appendChild(document.createTextNode("Settings"));
    return settings_button;
  }

  /**
   * Erzeugt den "Save"-Button.
   * @returns {HTMLButtonElement}
   */
  create_save_button() {
    const save_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/save.svg");
    img.setAttribute("alt", "Save");
    save_button.setAttribute("id", "resize");
    save_button.appendChild(img);
    save_button.appendChild(document.createTextNode("Save"));
    return save_button;
  }

  /**
   * Erzeugt den "Import"-Button.
   * @returns {HTMLButtonElement}
   */
  create_import_button() {
    const import_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/import.svg");
    img.setAttribute("alt", "Import");
    import_button.setAttribute("id", "import");
    import_button.appendChild(img);
    import_button.appendChild(document.createTextNode("Import"));
    return import_button;
  }

  /**
   * Erzeugt den "Export"-Button.
   * @returns {HTMLButtonElement}
   */
  create_export_button() {
    const export_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/export.svg");
    img.setAttribute("alt", "Export");
    export_button.setAttribute("id", "export");
    export_button.appendChild(img);
    export_button.appendChild(document.createTextNode("Export"));
    return export_button;
  }

  /**
   * initializes the tool listeners
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

customElements.define("file-area-tools-right", FileAreaToolsRight);
