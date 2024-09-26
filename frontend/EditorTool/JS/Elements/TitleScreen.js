import { BackendClient } from "../../../BackendClient/BackendClient.js";
import { Project } from "../Classes/Project.js";
import { EditorTool } from "./EditorTool.js";
import { AddProjectInputs } from "./TitleScreen/AddProjectInputs.js";
import { InitialButtons } from "./TitleScreen/InitialButtons.js";
import { ProjectsOverview } from "./TitleScreen/ProjectsOverview.js";

export class TitleScreen extends HTMLElement {
  /**
   * Landing screen of the Application
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.css = this.create_css_link();
    this.initial_buttons = new InitialButtons(this);
    this.add_project_inputs = new AddProjectInputs(this);
    this.projects_view = null;
    this.append(this.initial_buttons, this.css);
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
   * Called from AddPojectInputs
   * Makes call to the backend to create a new project
   * @param {String} project_name
   */
  async submit_button_clicked(project_name) {
    try {
      const project_data = await BackendClient.create_new_project(project_name);
      const new_project = new Project(
        project_data.id,
        project_data.name,
        project_data.createdAt,
        project_data.root_folder_id,
        project_data.root_folder
      );
      this.editor_tool.set_project(new_project);
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  }

  /**
   * Fetches all projects and shows them
   * @param {Event} event
   */
  async load_project_clicked(event) {
    try {
      const projects_data = await BackendClient.get_project_list();
      let projects = projects_data.map((project) => {
        return new Project(
          project.id,
          project.name,
          project.createdAt,
          project.root_folder_id
        );
      });
      this.render_loaded_projects(projects);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  /**
   * Creates a ProjectsOverView from the fetched projects
   * @param {Array<Object>} projects
   */
  render_loaded_projects(projects) {
    this.initial_buttons.remove();
    this.projects_view = new ProjectsOverview(this, projects);
    this.appendChild(this.projects_view);
  }

  /**
   * Creates existing project
   */
  new_project_clicked(event) {
    this.projects_view?.remove();
    this.initial_buttons?.remove();
    this.appendChild(this.add_project_inputs);
  }
}

customElements.define("title-screen", TitleScreen);
