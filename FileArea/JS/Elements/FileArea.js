import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { FileAreaToolsLeft } from "./FileAreaToolsLeft.js";
import { FileAreaToolsRight } from "./FileAreaToolsRight.js";
import { FileAreaView } from "./FileAreaView.js";

export class FileArea extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.css = document.createElement("link");
    this.css.setAttribute("href", "../FileArea/CSS/Elements/FileArea.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.file_tools_left = new FileAreaToolsLeft(this);
    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaToolsRight(this);
    this.appendChild(this.file_tools_left);
    this.appendChild(this.file_view);
    this.appendChild(this.file_tools_right);
    this.set_listeners();

    const test_button = document.createElement("button");
    test_button.appendChild(document.createTextNode("SWITCH"));
    test_button.addEventListener("click", (event) => {
      this.editor_tool.change_editor();
    });
    this.appendChild(test_button);
  }

  /**
   * From HTMLElement - called when unmounted from DOM
   */
  disconnectedCallback() {}

  /**
   * inits all EventListeners
   */
  set_listeners() {
    console.log("init Event Listeners");
  }
}

customElements.define("file-area", FileArea);
