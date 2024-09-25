import { Util } from "../../../../Util/Util.js";
import { Project } from "../../Classes/Project.js";
import { TitleScreen } from "../TitleScreen.js";

export class ProjectView extends HTMLElement {
  /**
   * View of a project in the ProjectsOverview
   * @param {TitleScreen} title_screen
   * @param {Project} project
   */
  constructor(title_screen, project) {
    super();
    this.title_screen = title_screen;
    this.project = project;
    this.handle_project_click = this.handle_project_click.bind(this);
    this.project_name_element = this.create_project_name_element();
    this.created_at_element = this.create_created_at_element();
    this.append(this.project_name_element, this.created_at_element);
    this.init();
  }

  /**
   * Creates the project name element
   * @returns {HTMLParagraphElement}
   */
  create_project_name_element() {
    return Util.create_element(
      "p",
      this.project._id,
      ["project-name"],
      this.project.name
    );
  }

  /**
   * Creates the created_at element with formatted date
   * @returns {HTMLParagraphElement}
   */
  create_created_at_element() {
    const date = new Date(this.project.created_at);
    const formatted_date = date.toLocaleString("en-GB", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return Util.create_element(
      "p",
      this.project._id,
      ["project-date"],
      `Created at: ${formatted_date}`
    );
  }

  init() {
    this.addEventListener("click", this.handle_project_click);
  }

  /**
   * Handles the click event on the project view
   */
  handle_project_click() {
    this.title_screen.editor_tool.set_project(this.project);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handle_project_click);
  }
}

customElements.define("project-view", ProjectView);
