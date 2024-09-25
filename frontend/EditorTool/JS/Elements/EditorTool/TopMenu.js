import { BackendClient } from "../../../../BackendClient/BackendClient.js";
import { EditorTool } from "../EditorTool.js";

/**
 * Header bar for the editor tool
 */
export class TopMenu extends HTMLElement {
  /**
   * @param {EditorTool} editor_tool
   */
  constructor(editor_tool) {
    super();
    this.classList.add("top-menu");
    this.editor_tool = editor_tool;

    this.project_name = "Untitled Project";
    this.file_name = "-";

    this.show_project_input_bind = this.show_project_input.bind(this);
    this.project_keydown_bind = this.project_keydown.bind(this);
    this.rename_project_bind = this.rename_project.bind(this);
    this.remove_project_input_bind = this.remove_project_input.bind(this);

    this.show_file_input_bind = this.show_file_input.bind(this);
    this.file_keydown_bind = this.file_keydown.bind(this);
    this.rename_file_bind = this.rename_file.bind(this);
    this.remove_file_input_bind = this.remove_file_input.bind(this);

    this.init();
  }

  init() {
    const project_container = this.create_project_container();
    const file_container = this.create_file_container();
    this.append(project_container, file_container);
  }

  // -------------------- Project Rename Methods --------------------

  /**
   * Handles keydown events in the project input field
   * @param {KeyboardEvent} event
   */
  project_keydown(event) {
    switch (event.key) {
      case "Enter":
        this.rename_project();
        break;
      case "Escape":
        this.remove_project_input();
        break;
    }
  }

  /**
   * Removes the project input field and restores the project name display
   */
  remove_project_input() {
    this.project_input_container.replaceWith(this.project_name_element);
  }

  /**
   * Shows the input field for renaming the project
   */
  show_project_input() {
    if (!this.project_input_container) {
      this.project_input_container = this.create_project_input_container();
    } else {
      this.project_input.value = this.project_name;
    }

    this.project_name_element.replaceWith(this.project_input_container);
    this.project_input.focus();
  }

  /**
   * Renames the project based on the input value
   */
  async rename_project() {
    const new_name = this.project_input.value.trim();

    if (new_name && new_name !== this.project_name) {
      try {
        await BackendClient.rename_project(
          this.editor_tool.project.id,
          new_name
        );
        this.editor_tool.project.name = new_name;
        this.update_project_name(new_name);
      } catch (error) {
        console.error("Error renaming project:", error);
      }
    }
    this.remove_project_input();
  }

  /**
   * Creates the input container for renaming the project
   * @returns {HTMLDivElement}
   */
  create_project_input_container() {
    const input_container = document.createElement("div");
    input_container.classList.add("input-container");

    this.project_input = document.createElement("input");
    this.project_input.type = "text";
    this.project_input.classList.add("rename-input");
    this.project_input.value = this.project_name;

    this.project_submit_icon = document.createElement("i");
    this.project_submit_icon.classList.add(
      "fa-solid",
      "fa-check",
      "submit-icon"
    );

    this.project_cancel_icon = document.createElement("i");
    this.project_cancel_icon.classList.add(
      "fa-solid",
      "fa-xmark",
      "cancel-icon"
    );

    this.project_input.addEventListener("keydown", this.project_keydown_bind);
    this.project_submit_icon.addEventListener(
      "click",
      this.rename_project_bind
    );
    this.project_cancel_icon.addEventListener(
      "click",
      this.remove_project_input_bind
    );

    input_container.append(
      this.project_input,
      this.project_submit_icon,
      this.project_cancel_icon
    );
    return input_container;
  }

  /**
   * Updates the project name displayed in the project container
   * @param {string} project_name
   */
  update_project_name(project_name) {
    this.project_name = project_name;
    this.project_name_element.textContent = project_name;
    if (this.project_input) {
      this.project_input.value = project_name;
    }
  }

  // -------------------- File Rename Methods --------------------

  /**
   * Handles keydown events in the file input field
   * @param {KeyboardEvent} event
   */
  file_keydown(event) {
    switch (event.key) {
      case "Enter":
        this.rename_file();
        break;
      case "Escape":
        this.remove_file_input();
        break;
    }
  }

  /**
   * Removes the file input field and restores the file name display
   */
  remove_file_input() {
    this.file_input_container.replaceWith(this.file_name_element);
  }

  /**
   * Shows the input field for renaming the file
   */
  show_file_input() {
    if (this.editor_tool.active_file) {
      if (!this.file_input_container) {
        this.file_input_container = this.create_file_input_container();
      } else {
        this.file_input.value = this.file_name;
      }

      this.file_name_element.replaceWith(this.file_input_container);
      this.file_input.focus();
    }
  }

  /**
   * Renames the file based on the input value
   */
  async rename_file() {
    const new_name = this.file_input.value.trim();

    if (new_name && new_name !== this.file_name) {
      try {
        await BackendClient.rename_file_by_id(
          this.editor_tool.active_file.id,
          new_name
        );
        this.editor_tool.active_file.name = new_name;
        this.update_file_name(new_name);
      } catch (error) {
        console.error("Error renaming file:", error);
      }
    }
    this.editor_tool.file_area.file_view.rebuild_view();
    this.remove_file_input();
  }

  /**
   * Creates the input container for renaming the file
   * @returns {HTMLDivElement}
   */
  create_file_input_container() {
    const input_container = document.createElement("div");
    input_container.classList.add("input-container");

    this.file_input = document.createElement("input");
    this.file_input.type = "text";
    this.file_input.classList.add("rename-input");
    this.file_input.value = this.file_name;

    this.file_submit_icon = document.createElement("i");
    this.file_submit_icon.classList.add("fa-solid", "fa-check", "submit-icon");

    this.file_cancel_icon = document.createElement("i");
    this.file_cancel_icon.classList.add("fa-solid", "fa-xmark", "cancel-icon");

    this.file_input.addEventListener("keydown", this.file_keydown_bind);
    this.file_submit_icon.addEventListener("click", this.rename_file_bind);
    this.file_cancel_icon.addEventListener(
      "click",
      this.remove_file_input_bind
    );

    input_container.append(
      this.file_input,
      this.file_submit_icon,
      this.file_cancel_icon
    );
    return input_container;
  }

  /**
   * Updates the file name displayed in the file container
   * @param {string} file_name
   */
  update_file_name(file_name) {
    this.file_name = file_name;
    this.file_name_element.textContent = file_name;
    if (this.file_input) {
      this.file_input.value = file_name;
    }
  }

  // -------------------- UI Creation Methods --------------------

  /**
   * Creates the project container element
   * @returns {HTMLDivElement}
   */
  create_project_container() {
    const project_container = document.createElement("div");
    project_container.classList.add("project-container");

    const project_label = document.createElement("span");
    project_label.textContent = "Project: ";

    this.project_name = this.editor_tool.project?.name || this.project_name;
    this.project_name_element = document.createElement("span");
    this.project_name_element.textContent = this.project_name;

    this.project_name_element.addEventListener(
      "click",
      this.show_project_input_bind
    );

    project_container.append(project_label, this.project_name_element);
    return project_container;
  }

  /**
   * Creates the file container element
   * @returns {HTMLDivElement}
   */
  create_file_container() {
    const file_container = document.createElement("div");
    file_container.classList.add("file-container");

    const file_label = document.createElement("span");
    file_label.textContent = "File: ";

    this.file_name = this.editor_tool.active_file?.name || this.file_name;
    this.file_name_element = document.createElement("span");
    this.file_name_element.textContent = this.file_name;

    this.file_name_element.addEventListener("click", this.show_file_input_bind);

    file_container.append(file_label, this.file_name_element);
    return file_container;
  }
}

customElements.define("top-menu", TopMenu);
