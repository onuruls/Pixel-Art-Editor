import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { Util } from "../../../Util/Util.js";
import { ColorUtil } from "../../../Util/ColorUtil.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
    this.tool_buttons = null;
    this.pixel_size_options = null;
    this.palette_colors = null;
    this.tool_buttons_clicked_bind = this.tool_button_clicked.bind(this);
    this.pixel_button_clicked_bind = this.pixel_button_clicked.bind(this);
    this.palette_clicked_bind = this.palette_clicked.bind(this);
    this.palette_context_bind = this.palette_context.bind(this);
  }

  /**
   * Renders the complete HTML structure for the tools section.
   * @returns {String}
   */
  render() {
    return `
      ${this.render_pixel_size_options()}
      ${this.render_tools()}
      <div class="color-selection">
        <input type="color" class="color-input" id="color_input" value="#000000" data-info='["Primary color"]' />
        <button class="swap-btn">
          <i class="fa-solid fa-right-left"></i>
        </button>
        <input type="color" class="color-input" id="secondary_color_input" value="#ffffff" data-info='["Secondary color"]' />
      </div>
      ${this.render_palettes()}
    `;
  }

  /**
   * Renders and creates the pixel size options.
   * @returns {String}
   */
  render_pixel_size_options() {
    return `
      <div class="pixel-size-options" title="Pixel size">
        ${this.create_pixel_size_button(1, "1px size")}
        ${this.create_pixel_size_button(2, "2px size")}
        ${this.create_pixel_size_button(4, "4px size")}
      </div>`;
  }
  create_pixel_size_button(size, info) {
    return `
      <button class="pixel-size-option" id="size_${size}" data-size="${size}" data-info='["${info}"]'>
        <div class="bg"></div>
      </button>`;
  }

  /**
   * Renders and creates the toolbox with all available tools.
   * @returns {String}
   */
  render_tools() {
    const tools = [
      { id: "pen", icon: "pen", info: JSON.stringify(["(P) Pen tool"]) },
      {
        id: "mirror_pen",
        icon: "mirror_pen",
        info: JSON.stringify([
          "(M) Mirror Pen",
          "(SHIFT) for horizontal axis",
          "(CTRL) for both axis",
        ]),
      },
      {
        id: "bucket",
        icon: "bucket",
        info: JSON.stringify(["(B) Bucket tool"]),
      },
      {
        id: "same_color",
        icon: "same_color_bucket",
        info: JSON.stringify(["(N) Same color bucket"]),
      },
      {
        id: "eraser",
        icon: "eraser",
        info: JSON.stringify(["(E) Eraser"]),
      },
      {
        id: "stroke",
        icon: "stroke",
        info: JSON.stringify(["(L) Line tool", "(SHIFT) for straight lines"]),
      },
      {
        id: "rectangle",
        icon: "rectangle",
        info: JSON.stringify(["(R) Rectangle tool", "(SHIFT) for square"]),
      },
      {
        id: "circle",
        icon: "circle",
        info: JSON.stringify(["(C) Ellipse tool", "(SHIFT) for circle"]),
      },
      {
        id: "move",
        icon: "move",
        info: JSON.stringify(["(V) Move tool"]),
      },
      {
        id: "shape_selection",
        icon: "fill_shape",
        info: JSON.stringify(["(Q) Shape selection"]),
      },
      {
        id: "rectangle_selection",
        icon: "rectangle_selection",
        info: JSON.stringify(["(T) Rectangle selection"]),
      },
      {
        id: "irregular_selection",
        icon: "irregular_selection",
        info: JSON.stringify(["(I) Irregular selection"]),
      },
      {
        id: "lighting",
        icon: "lighting",
        info: JSON.stringify(["(L) Lighting", "(SHIFT) for darken"]),
      },
      {
        id: "dithering",
        icon: "dithering",
        info: JSON.stringify(["(D) Dithering"]),
      },
      {
        id: "color_picker",
        icon: "color_picker",
        info: JSON.stringify(["(O) Color picker"]),
      },
    ];

    return `
      <div class="toolbox">
        ${tools.map((tool) => this.create_tool_button(tool)).join("")}
      </div>`;
  }
  create_tool_button(tool) {
    const infoArray = [`${tool.info}`];
    if (tool.extra) {
      infoArray.push(tool.extra);
    }
    return `
      <button id="${tool.id}" class="tool-button" data-tool="${tool.id}" data-info='${infoArray}'>
        <img src="img/icons/${tool.icon}.svg" alt="${tool.id}" />
      </button>`;
  }

  /**
   * Renders and creates the color palettes.
   * @returns {String}
   */
  render_palettes() {
    return `
      <div class="palettes">
        ${this.sprite_editor.palettes
          .map((color, i) => this.create_palette_input(i, color))
          .join("")}
      </div>`;
  }
  create_palette_input(index, color) {
    return `
      <input type="color" class="palette-color" data-index="${index}" value="${color}" 
      data-info='[" Color palette", "(SHIFT) to set palette to primary color", "(CTRL) to open color selector"]'>`;
  }

  /**
   * Initializes the event listeners for buttons and inputs.
   */
  init() {
    this.setup_tool_buttons();
    this.setup_pixel_size_buttons();
    this.setup_color_inputs();
    this.setup_palette_colors();
  }

  setup_tool_buttons() {
    this.tool_buttons = document.querySelectorAll(".tool-button");
    this.tool_buttons.forEach((button) => {
      const tool_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, tool_info);
      if (button.id === "pen") button.classList.add("active");
      button.addEventListener("click", this.tool_buttons_clicked_bind);
    });
  }

  /**
   * Called when tool button is clicked
   * @param {Event} event
   */
  tool_button_clicked(event) {
    this.tool_buttons.forEach((btn) => btn.classList.remove("active"));
    if (event.target.tagName === "BUTTON") {
      event.target.classList.add("active");
    } else {
      event.target.parentNode.classList.add("active");
    }
  }

  setup_pixel_size_buttons() {
    this.pixel_size_options = document.querySelectorAll(".pixel-size-option");
    this.pixel_size_options.forEach((button) => {
      const pixel_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, pixel_info);
      if (button.id === "size_1") button.classList.add("active");
      button.addEventListener("click", this.pixel_button_clicked_bind);
    });
  }

  /**
   * Callen when a pixel button is clicked
   * @param {Event} event
   */
  pixel_button_clicked(event) {
    this.pixel_size_options.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
    this.sprite_editor.set_pixel_size(event.target.dataset.size);
  }

  setup_palette_colors() {
    this.palette_colors = document.querySelectorAll(".palette-color");
    this.palette_colors.forEach((palette) => {
      const palette_info = JSON.parse(palette.getAttribute("data-info"));
      Util.create_tool_info(palette, palette_info);
      palette.addEventListener("click", this.palette_clicked_bind);

      palette.addEventListener("contextmenu", this.palette_context_bind);
    });
  }

  /**
   * Callen when a palette is clicked
   * @param {Event} event
   */
  palette_clicked(event) {
    const index = event.target.getAttribute("data-index");
    if (event.ctrlKey) {
      event.target.addEventListener(
        "input",
        () => {
          const newColor = event.target.value;
          this.set_palette_color(index, newColor);
        },
        { once: true }
      );
    } else if (event.shiftKey) {
      this.hide_color_input(event.target);
      const color = this.sprite_editor.selected_color;
      const hex_color = ColorUtil.rgb_array_to_hex(color);
      this.sprite_editor.palettes[index] = hex_color;
      event.target.value = hex_color;
    } else {
      this.hide_color_input(event.target);
      const color = event.target.value;
      this.sprite_editor.set_selected_color(ColorUtil.hex_to_rgb_array(color));
    }
  }

  /**
   * Callen when palette is rightclicked
   * @param {Event} event
   */
  palette_context(event) {
    event.preventDefault();
    const color = event.target.value;
    this.sprite_editor.set_secondary_color(ColorUtil.hex_to_rgb_array(color));
  }

  setup_color_inputs() {
    const swap_button = document.querySelector(".swap-btn");
    const primary_color_input = document.getElementById("color_input");
    const secondary_color_input = document.getElementById(
      "secondary_color_input"
    );

    Util.create_tool_info(primary_color_input, ["Primary color"]);
    Util.create_tool_info(secondary_color_input, ["Secondary color"]);

    swap_button.addEventListener("click", () => {
      const acc_color = primary_color_input.value;
      this.sprite_editor.set_selected_color(
        ColorUtil.hex_to_rgb_array(secondary_color_input.value)
      );
      this.sprite_editor.set_secondary_color(
        ColorUtil.hex_to_rgb_array(acc_color)
      );
    });
  }

  set_palette_color(index, color) {
    this.palette_colors[index].value = color;
    this.sprite_editor.palettes[index] = color;
  }

  hide_color_input(palette) {
    palette.style.display = "none";
    setTimeout(() => {
      palette.style.display = "inline-block";
    }, 0);
  }
}

customElements.define("sprite-tools", SpriteTools);
