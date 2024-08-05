import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";

export class InitialButtons extends HTMLElement {
  /**
   * The initial buttons of the TitleScreen
   * @param {TitleScreen} title_screen
   */
  constructor(title_screen) {
    super();
    this.title_screen = title_screen;
    this.new_button = this.create_new_button();
    this.open_button = this.create_open_button();
    this.appendChild(this.new_button);
    this.appendChild(this.open_button);
    this.init();
  }

  /**
   * New project button
   * @returns {HTMLButtonElement}
   */
  create_new_button() {
    return Util.create_element(
      "button",
      "new_button",
      ["title_button"],
      "Neues Projekt"
    );
  }

  /**
   * Open project button
   * @returns {HTMLButtonElement}
   */
  create_open_button() {
    return Util.create_element(
      "button",
      "open_button",
      ["title_button"],
      "Projekt öffnen"
    );
  }

  init() {
    this.open_button.addEventListener(
      "click",
      this.title_screen.load_project_clicked.bind(this.title_screen)
    );
    this.new_button.addEventListener(
      "click",
      this.title_screen.new_project_clicked.bind(this.title_screen)
    );
  }

  disconnectedCallback() {
    this.open_button.removeEventListener(
      "click",
      this.title_screen.load_project_clicked.bind(this.title_screen)
    );
    this.new_button.removeEventListener(
      "click",
      this.title_screen.new_project_clicked.bind(this.title_screen)
    );
  }
}

customElements.define("initial-buttons", InitialButtons);
