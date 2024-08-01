import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";
import { ProjectView } from "./ProjectView.js";

export class ProjectsOverview extends HTMLElement {
  /**
   *
   * @param {TitleScreen} title_screen
   * @param {String} projects
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
   *
   * @returns {HTMLButtonElement}
   */
  create_back_button() {
    return Util.create_element("button", "back_button", [], "Zurück");
  }

  /**
   *
   * @returns {HTMLDivElement}
   */
  create_views_container() {
    return Util.create_element("div", "", ["views_container"], "");
  }

  /**
   *
   * @returns {Array<HTMLDivElement>}
   */
  create_project_views() {
    return this.projects.map((project) => {
      return new ProjectView(this.title_screen, project);
    });
  }

  init() {
    this.project_views.forEach((view) => {
      this.views_container.appendChild(view);
      view.addEventListener(
        "click",
        this.title_screen.project_card_clicked.bind(this.title_screen, view.id)
      );
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
}

customElements.define("projects-overview", ProjectsOverview);
