import { Util } from "../../../../Util/Util.js";
import { TitleScreen } from "../TitleScreen.js";

export class AddProjectInputs extends HTMLElement {
  /**
   *
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
    this.init();
  }

  /**
   *
   * @returns {HTMLInputElement}
   */
  create_name_input() {
    const input = Util.create_element("input", "new_project_name");
    input.setAttribute("placeholder", "Projekt-Name");
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
    return Util.create_element("button", "back_button", [], "Zurück");
  }

  /**
   *
   * @returns {HTMLButtonElement}
   */
  create_submit_button() {
    return Util.create_element("button", "create_button", [], "Erstellen");
  }

  init() {
    this.back_button.addEventListener(
      "click",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );
    this.submit_button.addEventListener(
      "click",
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

  disconnectedCallback() {
    this.back_button.removeEventListener(
      "click",
      this.title_screen.back_button_clicked.bind(this.title_screen)
    );
    this.submit_button.removeEventListener(
      "click",
      this.title_screen.submit_button_clicked.bind(this.title_screen)
    );
  }
}

customElements.define("add-project-inputs", AddProjectInputs);
