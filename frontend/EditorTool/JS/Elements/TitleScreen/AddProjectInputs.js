import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";

export class AddProjectInputs extends HTMLElement {
  /**
   * Shown when InitialButton "New Project" is clicked
   * @param {TitleScreen} title_screen
   */
  constructor(title_screen) {
    super();
    this.title_screen = title_screen;
    this.name_input = this.create_name_input();
    this.button_div = this.create_button_div();
    this.back_button = this.create_back_button();
    this.submit_button = this.create_submit_button();
    this.button_div.appendChild(this.back_button);
    this.button_div.appendChild(this.submit_button);
    this.appendChild(this.name_input);
    this.appendChild(this.button_div);
  }

  /**
   *
   * @returns {HTMLInputElement}
   */
  create_name_input() {
    const input = Util.create_element("input", "new_project_name");
    input.setAttribute("placeholder", "Project name");
    return input;
  }

  /**
   *
   * @returns {HTMLDivElement}
   */
  create_button_div() {
    return Util.create_element("div", "", ["button_div"], "");
  }

  /**
   *
   * @returns {HTMLButtonElement}
   */
  create_back_button() {
    return Util.create_button(
      "back_button",
      ["btn"],
      "Back",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );
  }

  /**
   *
   * @returns {HTMLButtonElement}
   */
  create_submit_button() {
    return Util.create_button(
      "create_button",
      ["btn"],
      "Create",
      this.submit_button_clicked.bind(this)
    );
  }

  /**
   *
   * @param {Event} event
   */
  submit_button_clicked(event) {
    event.preventDefault();
    this.title_screen.submit_button_clicked(this.name_input.value);
  }
}

customElements.define("add-project-inputs", AddProjectInputs);
