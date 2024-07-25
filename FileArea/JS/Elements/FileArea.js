import { EditorTool } from "../../../EditorTool/JS/Elements/EditorTool.js";
import { FileAreaToolsLeft } from "./FileAreaToolsLeft.js";
import { FileAreaToolsRight } from "./FileAreaToolsRight.js";
import { FileAreaView } from "./FileAreaView.js";

export class FileArea extends HTMLElement {
  /**
   *
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.editor_tool = editor_tool;
    this.action = null;
    //this.sprite_db_request = window.indexedDB.open("sprite_db", 1);
  }

  /**
   * From HTMLElement - called when mounted to DOM
   */
  connectedCallback() {
    this.css = document.createElement("link");
    this.css.setAttribute("href", "../FileArea/CSS/Elements/FileArea.css");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.appendChild(this.css);
    this.file_tools_left = new FileAreaToolsLeft(this);
    this.file_view = new FileAreaView(this);
    this.file_tools_right = new FileAreaToolsRight(this);
    this.appendChild(this.file_tools_left);
    this.appendChild(this.file_view);
    this.appendChild(this.file_tools_right);
    this.set_listeners();
  }

  /**
   * From HTMLElement - called when unmounted from DOM
   */
  disconnectedCallback() {}

  /**
   * inits all EventListeners
   */
  set_listeners() {
    this.file_tools_left
      .querySelector("#create_folder_button")
      .addEventListener("click", () => this.create_new_folder());

    this.file_tools_left
      .querySelector("#delete_button")
      .addEventListener("click", () => this.toggle_radio_buttons("delete"));
  }
  /**
   * Creates a new folder element in the file view.
   * The folder includes a radio button, an image, and an input field for the folder name.
   */
  create_new_folder() {
    const folder_container = this.file_view.querySelector(".center-panel");

    const folder_div = document.createElement("div");
    folder_div.classList.add("folder");

    const folder_radio = document.createElement("input");
    folder_radio.type = "radio";
    folder_radio.name = "selected_folder";
    folder_radio.classList.add("folder-radio");
    folder_radio.style.display = "none"; // Initially hidden
    folder_radio.addEventListener("change", () =>
      this.update_confirm_buttons()
    );

    const folder_img = document.createElement("img");
    folder_img.src = "img/folder-empty.svg";
    folder_img.alt = "Folder Icon";
    folder_img.classList.add("folder-icon");

    const folder_name_input = document.createElement("input");
    folder_name_input.type = "text";
    folder_name_input.placeholder = "New Folder";
    folder_name_input.classList.add("folder-name-input");
    folder_name_input.addEventListener("blur", () => {
      const folder_name_text = document.createElement("span");
      folder_name_text.classList.add("folder-name");
      folder_name_text.textContent = folder_name_input.value || "New Folder";
      folder_div.appendChild(folder_name_text);
      folder_name_input.remove();
    });

    const folder_confirm = document.createElement("button");
    folder_confirm.textContent = "Confirm";
    folder_confirm.classList.add("folder-confirm");
    folder_confirm.style.display = "none"; // Initially hidden
    folder_confirm.addEventListener("click", () =>
      this.confirm_action(folder_radio)
    );

    folder_div.appendChild(folder_confirm);
    folder_div.appendChild(folder_radio);
    folder_div.appendChild(folder_img);
    folder_div.appendChild(folder_name_input);
    folder_container.appendChild(folder_div);

    folder_name_input.focus();
  }
  /**
   * Toggles the visibility of radio buttons for folder selection.
   * @param {string} action - The action to be performed (e.g., "delete").
   */
  toggle_radio_buttons(action) {
    const folder_radios = this.file_view.querySelectorAll(".folder-radio");
    folder_radios.forEach((radio) => {
      radio.style.display = radio.style.display === "none" ? "block" : "none";
    });

    this.current_action = action;
  }
  /**
   * Updates the visibility of confirm buttons based on the selected radio button.
   */
  update_confirm_buttons() {
    const folder_radios = this.file_view.querySelectorAll(".folder-radio");
    folder_radios.forEach((radio) => {
      const folder_div = radio.closest(".folder");
      const confirm_button = folder_div.querySelector(".folder-confirm");
      confirm_button.style.display = radio.checked ? "block" : "none";
    });
  }
  /**
   * Confirms the action for the selected folder.
   * @param {HTMLInputElement} radio - The selected radio button.
   */
  confirm_action(radio) {
    if (radio && radio.checked) {
      if (this.current_action === "delete") {
        this.delete_selected_folder(radio);
      }
    } else {
      alert("Please select a folder to confirm action.");
    }
    this.toggle_radio_buttons(); // Hide radio buttons after action
  }

  /**
   * Deletes the selected folder.
   * @param {HTMLInputElement} radio - The selected radio button.
   */
  delete_selected_folder(radio) {
    if (radio && radio.checked) {
      radio.closest(".folder").remove();
    }
  }
}

customElements.define("file-area", FileArea);
