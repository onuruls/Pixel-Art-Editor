import { SpriteEditor } from "../../../SpriteEditor/JS/Elements/SpriteEditor.js";
import { TopMenu } from "./EditorTool/TopMenu.js";
import { FileArea } from "../../../FileArea/JS/Elements/FileArea.js";
import { MapEditor } from "../../../MapEditor/JS/Elements/MapEditor.js";
import { TitleScreen } from "./TitleScreen.js";
import { Project } from "../Classes/Project.js";
import { BackendClient } from "../../../BackendClient/BackendClient.js";
import { NoFileOpenScreen } from "./EditorTool/NoFileOpenScreen.js";

export class EditorTool extends HTMLElement {
  constructor() {
    super();
    this.global_css = this.create_global_css_link();
    this.css = this.create_css_link();
    this.editor_container = this.create_editor_container();
    this.title_screen = new TitleScreen(this);
    this.top_menu = new TopMenu(this);
    this.sprite_editor = new SpriteEditor(this);
    this.map_editor = new MapEditor(this);
    this.file_area = new FileArea(this);
    this.no_file_open_screen = new NoFileOpenScreen(this);
    this.project = null;
    this.active_file = null;

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
   * Initializes the tool listeners
   */
  init() {
    this.show_no_file_open_screen();
  }

  /**
   * Called when directory is chosen in the title screen
   * @param {Project} project
   */
  async set_project(project) {
    const resp_project = await BackendClient.get_project_by_id(project.id);
    project.build_project_structure(resp_project.root_folder);
    this.project = project;
    this.title_screen.remove();
    this.appendChild(this.top_menu);
    this.appendChild(this.editor_container);
    this.appendChild(this.file_area);

    this.show_no_file_open_screen();
  }

  /**
   * Shows the NoFileOpenScreen component
   */
  show_no_file_open_screen() {
    this.remove_sprite_and_map_editors();

    if (!this.no_file_open_screen.isConnected) {
      this.editor_container.appendChild(this.no_file_open_screen);
    }
  }

  /**
   * Changes between Sprite and Map Editor
   */
  change_editor() {
    if (this.sprite_editor.isConnected) {
      this.sprite_editor.remove();
      this.editor_container.appendChild(this.map_editor);
      this.top_menu.set_editor_name("Map Editor");
      this.file_area.selected_editor = "MapEditor";
    } else if (this.map_editor.isConnected) {
      this.map_editor.remove();
      this.editor_container.appendChild(this.sprite_editor);
      this.top_menu.set_editor_name("Sprite Editor");
      this.file_area.selected_editor = "SpriteEditor";
    }
    this.set_active_file(null);
  }

  /**
   * Sets the active file and updates the UI accordingly
   * @param {File|null} file
   */
  set_active_file(file) {
    if (!file) {
      this.handle_no_file();
    } else {
      if (this.is_file_already_open(file)) {
        console.log("File is already open.");
      } else {
        this.load_editor_for_file(file);
        this.active_file = file;
        this.top_menu.update_file_name(file.name);
        this.remove_no_file_open_screen();
      }
    }
  }

  /**
   * Handles the case where no file is open
   */
  handle_no_file() {
    this.active_file = null;
    this.top_menu.update_file_name("-");
    this.show_no_file_open_screen();
  }

  /**
   * Checks if the file is already open
   * @param {File} file
   * @returns {boolean}
   */
  is_file_already_open(file) {
    return this.active_file && this.active_file.id === file.id;
  }

  /**
   * Loads the appropriate editor for the given file
   * @param {File} file
   */
  load_editor_for_file(file) {
    if (file.type === "png") {
      this.load_sprite_editor(file);
    } else if (file.type === "tmx") {
      this.load_map_editor(file);
    }
  }

  /**
   * Loads the Sprite Editor with the given file data
   * @param {File} file
   */
  load_sprite_editor(file) {
    if (this.sprite_editor.isConnected) {
      this.sprite_editor.handle_loaded_file(file.data);
    } else {
      this.remove_sprite_and_map_editors();
      this.editor_container.appendChild(this.sprite_editor);
      this.sprite_editor.handle_loaded_file(file.data);
    }
  }

  load_map_editor(file) {
    if (!this.map_editor.isConnected) {
      this.remove_sprite_and_map_editors();
    }
    if (this.map_editor.map_tools) {
      this.map_editor.map_tools.fetch_assets();
    }
    this.map_editor.load_map_editor(file, this.editor_container);
  }

  /**
   * Removes the NoFileOpenScreen component
   */
  remove_no_file_open_screen() {
    if (this.no_file_open_screen.isConnected) {
      this.no_file_open_screen.remove();
    }
  }

  /**
   * Removes both SpriteEditor and MapEditor if they are in the DOM
   */
  remove_sprite_and_map_editors() {
    if (this.sprite_editor.isConnected) {
      this.sprite_editor.remove();
    }
    if (this.map_editor.isConnected) {
      this.map_editor.remove();
    }
  }

  async open_map_file(file_id) {
    const map_file = await BackendClient.get_file_by_id(file_id);
    this.set_active_file(map_file);
  }
}

customElements.define("editor-tool", EditorTool);
