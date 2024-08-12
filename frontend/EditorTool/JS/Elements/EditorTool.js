import { SpriteEditor } from "../../../SpriteEditor/JS/Elements/SpriteEditor.js";
import { FileArea } from "../../../FileArea/JS/Elements/FileArea.js";
import { MapEditor } from "../../../MapEditor/JS/Elements/MapEditor.js";
import { TitleScreen } from "./TitleScreen.js";
import { Folder } from "../Classes/Folder.js";
import { Project } from "../Classes/Project.js";

export class EditorTool extends HTMLElement {
  constructor() {
    super();
    this.global_css = this.create_global_css_link();
    this.css = this.create_css_link();
    this.editor_container = this.create_editor_container();
    this.title_screen = new TitleScreen(this);
    this.sprite_editor = new SpriteEditor(this);
    this.map_editor = new MapEditor(this);
    this.file_area = new FileArea(this);
    this.project = null;
    this.appendChild(this.css);
    this.appendChild(this.title_screen);
    this.init();
  }

  /**
   * CSS
   * @returns {HTMLLinkElement}
   */
  create_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", "../EditorTool/CSS/Elements/EditorTool.css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   * Global CSS
   * @returns {HTMLLinkElement}
   */
  create_global_css_link() {
    const css = document.createElement("link");
    css.setAttribute("href", "../EditorTool/CSS/Global.css");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    return css;
  }

  /**
   * Editor-Container
   * @returns {HTMLDivElement}
   */
  create_editor_container() {
    const editor_container = document.createElement("div");
    editor_container.setAttribute("id", "editor_container");
    return editor_container;
  }

  /**
   * initializes the tool listeners
   */
  init() {}

  /**
   * Called when directory is chosen in the title screen
   * @param {Project} project
   */
  async set_project(project) {
    const response = await fetch(
      `http://localhost:3000/projects/${project.id}`
    );
    const resp_project = await response.json();
    console.log(resp_project);
    project.build_project_structure(resp_project.root_folder);
    this.project = project;
    this.title_screen.remove();
    this.editor_container.appendChild(this.sprite_editor);
    this.appendChild(this.editor_container);
    this.appendChild(this.file_area);
  }

  /**
   * Changes Sprite- and MapEditor
   */
  change_editor() {
    if (this.sprite_editor.isConnected) {
      this.sprite_editor.remove();
      this.editor_container.appendChild(this.map_editor);
      this.file_area.file_tools_left.set_editor_name("Sprite Editor");
    } else {
      this.map_editor.remove();
      this.editor_container.appendChild(this.sprite_editor);
      this.file_area.file_tools_left.set_editor_name("Map Editor");
    }
  }
}

customElements.define("editor-tool", EditorTool);
