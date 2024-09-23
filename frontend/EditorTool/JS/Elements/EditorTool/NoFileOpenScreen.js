import { EditorTool } from "../EditorTool.js";

export class NoFileOpenScreen extends HTMLElement {
    /**
     * Represents the screen displayed when no file is open.
     * @param {EditorTool} editor_tool
     */
    constructor(editor_tool) {
        super();
        this.editor_tool = editor_tool;

        const css_link = document.createElement("link");
        css_link.setAttribute("href", "../EditorTool/CSS/Elements/NoFileOpenScreen.css");
        css_link.setAttribute("rel", "stylesheet");
        css_link.setAttribute("type", "text/css");
        this.appendChild(css_link);

        this.init();
    }

    /**
     * Initializes the component.
     */
    init() {
        this.classList.add("no-file-open-screen");

        const message = document.createElement("p");
        message.textContent = "Please open a file to load the respective editor.";

        const create_sprite_file_button = document.createElement("button");
        create_sprite_file_button.textContent = "Create New Sprite File";
        create_sprite_file_button.addEventListener("click", () => 
            this.create_new_file("png")
        );

        const create_map_file_button = document.createElement("button");
        create_map_file_button.textContent = "Create New Map File";
        create_map_file_button.addEventListener("click", () => 
            this.create_new_file("tmx")
        );

        const button_container = document.createElement("div");
        button_container.classList.add("button-container");

        button_container.appendChild(create_sprite_file_button);
        button_container.appendChild(create_map_file_button);

        this.appendChild(message);
        this.appendChild(button_container);
    }

    /**
     * Creates a new file and opens it
     * @param {string} file_type
     */
    async create_new_file(file_type) {
        const file_name = prompt("Please enter a file name:");
        if (file_name) {
            try {
                const new_file = await this.editor_tool.file_area.file_system_handler.create_file(file_name, file_type);

                this.editor_tool.set_active_file(new_file);

                if (file_type === "png") {
                    this.editor_tool.sprite_editor.handle_loaded_matrix(new_file.data.frames[0].matrix);
                } else if (file_type === "tmx") {
                    console.log("Not implemented yet");
                }

                this.remove();
            } catch (error) {
                console.error("Error creating file:", error);
            }
        }
    }
}

customElements.define("no-file-open-screen", NoFileOpenScreen);
