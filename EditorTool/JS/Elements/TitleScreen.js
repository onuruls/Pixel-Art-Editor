import { EditorTool } from "./EditorTool.js";

export class TitleScreen extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.css = this.create_css_link();
    this.button_div = this.create_button_div();
    this.open_button = this.create_open_button();
    this.new_button = this.create_new_button();
    this.button_div.appendChild(this.open_button);
    this.button_div.appendChild(this.new_button);
    this.appendChild(this.css);
    this.appendChild(this.button_div);
    this.init();
  }

  /**
   * CSS
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", "../EditorTool/CSS/Elements/TitleScreen.css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   * Button div
   * @returns {HTMLDivElement}
   */
  create_button_div() {
    const button_div = document.createElement("div");
    button_div.classList.add("button_container");
    return button_div;
  }

  /**
   * Open project button
   * @returns {HTMLButtonElement}
   */
  create_open_button() {
    const open_button = document.createElement("button");
    open_button.setAttribute("id", "open_button");
    open_button.classList.add("title_button");
    open_button.appendChild(document.createTextNode("Open Project"));
    return open_button;
  }

  /**
   * New project button
   * @returns {HTMLButtonElement}
   */
  create_new_button() {
    const new_button = document.createElement("button");
    new_button.setAttribute("id", "new_button");
    new_button.classList.add("title_button");
    new_button.appendChild(document.createTextNode("New Project"));
    return new_button;
  }

  /**
   * initialzies tool listeners
   */
  init() {
    this.open_button.addEventListener("click", this.open_project.bind(this));
    this.new_button.addEventListener("click", this.new_project.bind(this));
  }

  /**
   * Opens existing project
   * @param {Event} event
   */
  async open_project(event) {
    try {
      const dir_handle = await window.showDirectoryPicker();
      this.editor_tool.set_directory_handler(dir_handle);
    } catch (error) {
      console.warn("Error loading directory");
    }
  }

  /**
   * Creates existing project
   * @param {Event} event
   */
  async new_project(event) {
    try {
      const dir_handle = await window.showDirectoryPicker();
      this.editor_tool.set_directory_handler(dir_handle);
    } catch (error) {
      console.warn("Error loading directory");
    }
  }

  disconnectedCallback() {
    this.open_button.removeEventListener("click", this.open_project.bind(this));
    this.new_button.removeEventListener("click", this.new_project.bind(this));
  }
}

customElements.define("title-screen", TitleScreen);
