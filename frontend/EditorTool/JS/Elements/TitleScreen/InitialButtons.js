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
  }

  /**
   * New project button
   * @returns {HTMLButtonElement}
   */
  create_new_button() {
    return Util.create_button(
      "new_button",
      ["btn", "title-btn"],
      "New Project",
      this.title_screen.new_project_clicked.bind(this.title_screen)
    );
  }

  /**
   * Open project button
   * @returns {HTMLButtonElement}
   */
  create_open_button() {
    return Util.create_button(
      "open_button",
      ["btn"],
      "Open Project",
      this.title_screen.load_project_clicked.bind(this.title_screen)
    );
  }
}

customElements.define("initial-buttons", InitialButtons);
