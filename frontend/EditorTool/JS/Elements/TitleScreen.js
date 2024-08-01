import { EditorTool } from "./EditorTool.js";
import { AddProjectInputs } from "./TitleScreen/AddProjectInputs.js";
import { InitialButtons } from "./TitleScreen/InitialButtons.js";
import { ProjectsOverview } from "./TitleScreen/ProjectsOverview.js";

export class TitleScreen extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.css = this.create_css_link();
    this.initial_buttons = new InitialButtons(this);
    this.add_project_inputs = new AddProjectInputs(this);
    this.projects_view = null;
    this.appendChild(this.initial_buttons);
    this.appendChild(this.css);
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
   * initialzies tool listeners
   */
  init() {}

  back_button_clicked() {
    this.add_project_inputs.remove();
    this.projects_view?.remove();
    this.appendChild(this.initial_buttons);
  }

  /**
   *
   * @param {String} project_name
   */
  async submit_button_clicked(project_name) {
    const response = await fetch("http://localhost:3000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: project_name }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const new_project = await response.json();
    this.editor_tool.set_project(new_project);
  }

  /**
   *
   * @param {String} project_id
   */
  async project_card_clicked(project_id) {
    const response = await fetch(
      `http://localhost:3000/projects/${project_id}`
    );
    if (!response.ok) {
      throw new Error("Error fetching projects.");
    }
    console.log(`PROJEKTE: ${projects}`);
  }

  /**
   * Opens existing project
   * @param {Event} event
   */
  async load_project_clicked(event) {
    const response = await fetch("http://localhost:3000/projects");
    if (!response.ok) {
      throw new Error("Error fetching projects.");
    }

    const projects = await response.json();
    this.render_loaded_projects(projects);
  }

  /**
   *
   * @param {Array<Object>} projects
   */
  render_loaded_projects(projects) {
    this.initial_buttons.remove();
    this.projects_view = new ProjectsOverview(this, projects);
    this.appendChild(this.projects_view);
  }

  /**
   * Creates existing project
   * @param {Event} event
   */
  new_project(event) {
    this.initial_buttons.remove();
    this.appendChild(this.add_project_inputs);
  }

  disconnectedCallback() {}
}

customElements.define("title-screen", TitleScreen);
