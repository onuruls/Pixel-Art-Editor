import { Util } from "../../../../Util/Util.js";
import { Project } from "../../Classes/Project.js";
import { TitleScreen } from "../TitleScreen.js";

export class ProjectView extends HTMLElement {
  /**
   * View of a project in the ProjctOverView
   * @param {TitleScreen} title_screen
   * @param {Project} project
   */
  constructor(title_screen, project) {
    super();
    this.title_screen = title_screen;
    this.project = project;
    this.project_name = this.create_project_name();
    this.created_at = this.create_created_at();
    this.appendChild(this.project_name);
    this.appendChild(this.created_at);
    this.init();
  }

  /**
   *
   * @returns {HTMLParagraphElement}
   */
  create_project_name() {
    return Util.create_element(
      "p",
      this.project._id,
      ["project-name"],
      this.project.name
    );
  }
  /**
   *
   * @returns {HTMLParagraphElement}
   */
  create_created_at() {
    const date = new Date(this.project.created_at);
    const formattedDate = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")} - ${date.getDate().toString().padStart(2, "0")}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${date.getFullYear()}`;

    return Util.create_element(
      "p",
      this.project._id,
      ["project-date"],
      `Created at: ${formattedDate}`
    );
  }

  init() {
    this.addEventListener(
      "click",
      this.title_screen.editor_tool.set_project.bind(
        this.title_screen.editor_tool,
        this.project
      )
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      "click",
      this.title_screen.editor_tool.set_project.bind(
        this.title_screen.editor_tool,
        this.project
      )
    );
  }
}

customElements.define("project-view", ProjectView);
