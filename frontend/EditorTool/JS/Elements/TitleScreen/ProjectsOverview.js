import { BackendClient } from "../../../../BackendClient/BackendClient.js";
import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";
import { ProjectView } from "./ProjectView.js";
import { Project } from "../../Classes/Project.js";

export class ProjectsOverview extends HTMLElement {
  /**
   * Overview of all projects in the database
   * @param {TitleScreen} title_screen
   * @param {Project[]} projects
   */
  constructor(title_screen, projects) {
    super();
    this.title_screen = title_screen;
    this.projects = projects;
    this.views_container = this.create_views_container();
    this.overview_buttons = this.create_overview_buttons();
    this.init();
  }

  /**
   * Creates the container for project views
   * @returns {HTMLDivElement}
   */
  create_views_container() {
    const container = Util.create_element("div", "", ["views-container"]);
    this.projects.forEach((project) => {
      const project_view = this.create_project_view(project);
      container.appendChild(project_view);
    });
    return container;
  }

  /**
   * Creates the project view element
   * @param {Project} project
   * @returns {HTMLDivElement}
   */
  create_project_view(project) {
    const project_container = Util.create_element("div", "", [
      "project-container",
    ]);

    const project_buttons = this.create_project_buttons(project);
    const project_view = new ProjectView(this.title_screen, project);

    project_container.append(project_buttons, project_view);
    return project_container;
  }

  /**
   * Creates buttons for each project (rename, delete)
   * @param {Project} project
   * @returns {HTMLDivElement}
   */
  create_project_buttons(project) {
    const buttons_container = Util.create_element("div", "", [
      "project-buttons",
    ]);

    const rename_button = Util.create_button(
      `rename-${project.id}`,
      ["btn", "rename-btn"],
      "",
      () => this.rename_project(project),
      ["fa-solid", "fa-edit", "fa-fw"]
    );

    const delete_button = Util.create_button(
      `delete-${project.id}`,
      ["btn", "delete-btn"],
      "",
      () => this.delete_project(project),
      ["fa-solid", "fa-trash", "fa-fw"]
    );

    buttons_container.append(rename_button, delete_button);
    return buttons_container;
  }

  /**
   * Creates the overview buttons (back, new project)
   * @returns {HTMLDivElement}
   */
  create_overview_buttons() {
    const buttons_container = Util.create_element("div", "", [
      "overview-buttons",
    ]);

    const back_button = Util.create_button(
      "back_button",
      ["btn"],
      "Back",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );

    const create_project_button = Util.create_button(
      "create_project_button",
      ["btn"],
      "New Project",
      this.title_screen.new_project_clicked.bind(this.title_screen)
    );

    buttons_container.append(back_button, create_project_button);
    return buttons_container;
  }

  init() {
    this.append(this.views_container, this.overview_buttons);
  }

  /**
   * Handles renaming of a project
   * @param {Project} project
   */
  async rename_project(project) {
    const new_name = prompt(`Enter new name for project "${project.name}":`);
    if (new_name) {
      try {
        await BackendClient.rename_project(project.id, new_name);
        project.name = new_name;
        this.render_loaded_projects();
      } catch (error) {
        console.error("Error renaming project:", error);
      }
    }
  }

  /**
   * Handles deletion of a project
   * @param {Project} project
   */
  async delete_project(project) {
    const confirmation = confirm(
      `Are you sure you want to delete project "${project.name}"?`
    );
    if (confirmation) {
      try {
        await BackendClient.delete_project(project.id);
        this.projects = this.projects.filter((p) => p.id !== project.id);
        this.render_loaded_projects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  }

  /**
   * Re-renders the list of projects
   */
  render_loaded_projects() {
    this.views_container.innerHTML = "";
    this.projects.forEach((project) => {
      const project_view = this.create_project_view(project);
      this.views_container.appendChild(project_view);
    });
  }
}

customElements.define("projects-overview", ProjectsOverview);
