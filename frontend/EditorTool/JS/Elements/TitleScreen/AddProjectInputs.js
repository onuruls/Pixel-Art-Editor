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
    this.append(this.name_input, this.button_div);
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
    const button_div = Util.create_element("div", "", ["button-div"]);

    const back_button = Util.create_button(
      "back_button",
      ["btn"],
      "Back",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );

    const submit_button = Util.create_button(
      "create_button",
      ["btn"],
      "Create",
      this.submit_button_clicked.bind(this)
    );

    button_div.append(back_button, submit_button);
    return button_div;
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
