import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";
import { ProjectView } from "./ProjectView.js";

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
    return Util.create_element("button", "back_button", [], "Zurück");
  }

  /**
   * @returns {HTMLDivElement}
   */
  create_views_container() {
    return Util.create_element("div", "", ["views_container"], "");
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

      const rename_button = this.create_rename_button(project);
      const delete_button = this.create_delete_button(project);

      project_container.append(rename_button, delete_button, project_view);
      return project_container;
    });
  }

  /**
   * @param {Project} project
   * @returns {HTMLButtonElement}
   */
  create_rename_button(project) {
    const rename_button = Util.create_element(
      "button",
      `rename-${project.id}`,
      ["btn"],
      "Rename"
    );
    rename_button.addEventListener("click", () => this.rename_project(project));
    return rename_button;
  }

  /**
   * @param {Project} project
   * @returns {HTMLButtonElement}
   */
  create_delete_button(project) {
    const delete_button = Util.create_element(
      "button",
      `delete-${project.id}`,
      ["btn"],
      "Delete"
    );
    delete_button.addEventListener("click", () => this.delete_project(project));
    return delete_button;
  }

  init() {
    this.project_views.forEach((view) => {
      this.views_container.appendChild(view);
    });
    this.appendChild(this.views_container);
    this.appendChild(this.back_button);
  }

  connectedCallback() {
    this.back_button.addEventListener(
      "click",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );
  }

  disconnectedCallback() {
    this.back_button.removeEventListener(
      "click",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );
  }

  /**
   * Handles renaming of the project
   * @param {Project} project
   */
  rename_project(project) {
    console.log(`Renaming project ${project.id}`);
  }

  /**
   * Handles deletion of the project
   * @param {Project} project
   */
  delete_project(project) {
    console.log(`Deleting project ${project.id}`);
  }
}

customElements.define("projects-overview", ProjectsOverview);
