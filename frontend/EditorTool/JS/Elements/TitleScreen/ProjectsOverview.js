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
    return Util.create_button("back_button", ["btn"], "Back", () =>
      this.title_screen.back_button_clicked()
    );
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
    const rename_button = Util.create_button(
      `rename-${project.id}`,
      ["btn"],
      "Rename",
      () => this.rename_project(project)
    );
    return rename_button;
  }

  /**
   * @param {Project} project
   * @returns {HTMLButtonElement}
   */
  create_delete_button(project) {
    const delete_button = Util.create_button(
      `delete-${project.id}`,
      ["btn"],
      "Delete",
      () => this.delete_project(project)
    );
    return delete_button;
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
        const response = await fetch(
          `http://localhost:3000/projects/${project.id}/rename`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ new_name }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to rename project.");
        }

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
        const response = await fetch(
          `http://localhost:3000/projects/${project.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete project.");
        }

        console.log(`Project ${project.id} deleted.`);
        this.projects = this.projects.filter((p) => p.id !== project.id);
        this.render_loaded_projects(this.projects);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  }
}

customElements.define("projects-overview", ProjectsOverview);
