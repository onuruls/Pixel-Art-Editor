import { FileArea } from "./FileArea.js";

export class FileAreaToolsLeft extends HTMLElement {
  /**
   *
   * @param {FileArea} file_area
   */
  constructor(file_area) {
    super();
    this.file_area = file_area;
    this.editor_name = "Map Editor";
    this.css = this.create_css_link();
    this.editor_button = this.create_editor_button();
    this.create_folder_button = this.create_create_folder_button();
    this.delete_button = this.create_delete_button();
    this.rename_button = this.create_rename_button();
    this.appendChild(this.css);
    this.appendChild(this.editor_button);
    this.appendChild(this.create_folder_button);
    this.appendChild(this.delete_button);
    this.appendChild(this.rename_button);
    this.init();
  }
  /**
   *
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", `../FileArea/CSS/Elements/FileAreaToolsLeft.css`);
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   *
   * @returns {HTMLButtonElement}
   */
  create_editor_button() {
    const editor_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/chevron-left-circle.svg");
    img.setAttribute("alt", this.editor_name);
    editor_button.setAttribute("id", "switch_to");
    editor_button.appendChild(img);
    editor_button.appendChild(document.createTextNode(this.editor_name));
    return editor_button;
  }

  /**
   * Erzeugt den "Create Folder"-Button.
   * @returns {HTMLButtonElement}
   */
  create_create_folder_button() {
    const create_folder_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/new-folder.svg");
    img.setAttribute("alt", "New Folder");
    create_folder_button.setAttribute("id", "create_folder_button");
    create_folder_button.appendChild(img);
    create_folder_button.appendChild(document.createTextNode("New Folder"));
    return create_folder_button;
  }

  /**
   * Erzeugt den "Delete"-Button.
   * @returns {HTMLButtonElement}
   */
  create_delete_button() {
    const delete_folder_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/delete.svg");
    img.setAttribute("alt", "Delete");
    delete_folder_button.setAttribute("id", "delete_button");
    delete_folder_button.appendChild(img);
    delete_folder_button.appendChild(document.createTextNode("Delete"));
    return delete_folder_button;
  }

  /**
   * Erzeugt den "Rename"-Button.
   * @returns {HTMLButtonElement}
   */
  create_rename_button() {
    const rename_folder_button = document.createElement("button");
    const img = document.createElement("img");
    img.setAttribute("src", "img/rename.svg");
    img.setAttribute("alt", "Rename");
    rename_folder_button.setAttribute("id", "rename_button");
    rename_folder_button.appendChild(img);
    rename_folder_button.appendChild(document.createTextNode("Rename"));
    return rename_folder_button;
  }

  init() {
    this.editor_button.addEventListener(
      "click",
      this.file_area.editor_tool.change_editor.bind(this.file_area.editor_tool)
    );

    this.create_folder_button.addEventListener(
      "click",
      this.file_area.create_new_folder.bind(this.file_area)
    );

    this.delete_button.addEventListener(
      "click",
      this.file_area.delete_selected_folder.bind(this.file_area)
    );
    this.rename_button.addEventListener(
      "click",
      this.file_area.rename_selected_folder.bind(this.file_area)
    );
  }

  set_editor_name(name) {
    this.querySelector("#switch_to img").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }
}

customElements.define("file-area-tools-left", FileAreaToolsLeft);
