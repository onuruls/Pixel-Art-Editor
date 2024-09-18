import { BackendClient } from "../../../../BackendClient/BackendClient.js";
import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";
import { ProjectView } from "./ProjectView.js";
import { Project } from "../../Classes/Project.js";

export class ProjectsOverview extends HTMLElement {
  /**
   * Overview over all projects in the database
   * @param {TitleScreen} title_screen
   * @param {Array<Project>} projects
   */
  constructor(title_screen, projects) {
    super();
    this.title_screen = title_screen;
    this.projects = projects;
    this.back_button = this.create_back_button();
    this.views_container = this.create_views_container();
    this.project_views = this.create_project_views();
    this.init();
  }

  /**
   * @returns {HTMLButtonElement}
   */
  create_back_button() {
    return Util.create_button("back_button", ["btn"], "Back", () =>
      this.title_screen.back_button_clicked()
    );
  }

  /**
   * @returns {HTMLDivElement}
   */
  create_views_container() {
    return Util.create_element("div", "", ["views-container"], "");
  }

  /**
   * @returns {Array<HTMLDivElement>}
   */
  create_project_views() {
    return this.projects.map((project) => {
      const project_container = Util.create_element(
        "div",
        "",
        ["project-container"],
        ""
      );

      const project_view = new ProjectView(this.title_screen, project);

      const project_buttons = this.create_project_buttons(project);

      project_container.append(project_buttons, project_view);
      return project_container;
    });
  }

  /**
   * @param {Project} project
   * @returns {HTMLDivElement}
   */
  create_project_buttons(project) {
    const project_buttons = Util.create_element(
      "div",
      "",
      ["project-buttons"],
      ""
    );

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

    project_buttons.append(rename_button, delete_button);
    return project_buttons;
  }

  init() {
    this.project_views.forEach((view) => {
      this.views_container.appendChild(view);
    });
    this.appendChild(this.views_container);
    this.appendChild(this.back_button);
  }

  /**
   * Handles renaming of the project
   * @param {Project} project
   */
  async rename_project(project) {
    const new_name = prompt(`Enter new name for project ${project.name}:`);
    if (new_name) {
      try {
        await BackendClient.rename_project(project.id, new_name);
        console.log(`Project ${project.id} renamed to ${new_name}`);
        project.name = new_name;
        this.render_loaded_projects(this.projects);
      } catch (error) {
        console.error("Error renaming project:", error);
      }
    }
  }

  /**
   * Handles deletion of the project
   * @param {Project} project
   */
  async delete_project(project) {
    if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
      try {
        await BackendClient.delete_project(project.id);
        console.log(`Project ${project.id} deleted.`);
        this.projects = this.projects.filter((p) => p.id !== project.id);
        this.render_loaded_projects(this.projects);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  }

  /**
   * Re-renders the list of projects.
   * @param {Array<Project>} projects
   */
  render_loaded_projects(projects) {
    this.views_container.innerHTML = "";
    this.projects = projects;
    this.project_views = this.create_project_views();

    this.project_views.forEach((view) => {
      this.views_container.appendChild(view);
    });
  }
}

customElements.define("projects-overview", ProjectsOverview);
