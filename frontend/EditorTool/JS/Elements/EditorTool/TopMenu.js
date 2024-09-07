export class TopMenu extends HTMLElement {
  constructor(editor_tool) {
    super();
    this.classList.add("top-menu");
    this.editor_tool = editor_tool;
    this.project_name = "Untitled Project";
    this.project_container = null;
    this.project_name_element = null;
    this.editor_name = "Map Editor";
    this.editor_button = this.create_editor_button();
    this.appendChild(this.editor_button);
  }

  connectedCallback() {
    this.init();
  }

  create_editor_button() {
    const editor_button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-circle-chevron-left", "fa-fw");
    icon.setAttribute("alt", this.editor_name);
    editor_button.setAttribute("id", "switch_to");
    editor_button.appendChild(icon);
    editor_button.appendChild(document.createTextNode(this.editor_name));
    return editor_button;
  }

  create_project_container() {
    this.project_container = document.createElement("div");
    this.project_container.classList.add("project-container");

    const project_label = document.createElement("span");
    project_label.textContent = "Project: ";

    this.project_name_element = document.createElement("span");
    this.project_name = this.editor_tool.project?.name || this.project_name;
    this.project_name_element.textContent = this.project_name;

    this.project_container.appendChild(project_label);
    this.project_container.appendChild(this.project_name_element);

    this.project_name_element.addEventListener("click", () =>
      this.show_input_field()
    );

    return this.project_container;
  }

  init() {
    this.editor_button.addEventListener(
      "click",
      this.editor_tool.change_editor.bind(this.editor_tool)
    );
    const project_container = this.create_project_container();
    this.appendChild(project_container);
  }

  show_input_field() {
    const input_container = document.createElement("div");
    input_container.classList.add("input-container");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("rename-input");
    input.value = this.project_name;

    // Create submit and cancel icons
    const submit_icon = document.createElement("i");
    submit_icon.classList.add("fa-solid", "fa-check", "submit-icon");

    const cancel_icon = document.createElement("i");
    cancel_icon.classList.add("fa-solid", "fa-xmark", "cancel-icon");

    // Append input and icons to container
    input_container.appendChild(input);
    input_container.appendChild(submit_icon);
    input_container.appendChild(cancel_icon);

    const project_label =
      this.project_container.querySelector("span:last-child");
    project_label.replaceWith(input_container);

    // Add event listeners for input, submit, and cancel
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.rename_project(input_container);
      } else if (e.key === "Escape") {
        input_container.replaceWith(project_label);
      }
    });

    submit_icon.addEventListener("click", () => {
      this.rename_project(input_container);
    });

    cancel_icon.addEventListener("click", () => {
      input_container.replaceWith(project_label);
    });

    input.focus();
  }

  async rename_project(input_container) {
    const input = input_container.querySelector("input");
    const new_name = input.value.trim();

    if (new_name && new_name !== this.project_name) {
      try {
        const response = await fetch(
          `http://localhost:3000/projects/${this.editor_tool.project.id}/rename`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_name }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to rename project.");
        }

        this.editor_tool.project.name = new_name;
        this.project_name = new_name;
      } catch (error) {
        console.error("Error renaming project:", error);
      }
    }

    this.project_name_element.textContent = this.project_name;
    input_container.replaceWith(this.project_name_element);
  }

  set_editor_name(name) {
    this.querySelector("#switch_to i").alt = name;
    this.querySelector("#switch_to").lastChild.textContent = name;
  }
}

customElements.define("top-menu", TopMenu);
