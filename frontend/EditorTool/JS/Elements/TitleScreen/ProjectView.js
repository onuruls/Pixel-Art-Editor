import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";

export class ProjectView extends HTMLElement {
  /**
   *
   * @param {TitleScreen} title_screen
   * @param {Object} project
   */
  constructor(title_screen, project) {
    super();
    this.title_screen = this.title_screen;
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
      ["project_name"],
      this.project.name
    );
  }
  /**
   *
   * @returns {HTMLParagraphElement}
   */
  create_created_at() {
    return Util.create_element(
      "p",
      this.project._id,
      ["project_date"],
      `Erstellt am: ${this.project.created_at}`
    );
  }

  init() {}
}

customElements.define("project-view", ProjectView);
