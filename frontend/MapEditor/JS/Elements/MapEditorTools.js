import { MapEditorPart } from "./MapEditorPart.js";
import { Util } from "../../../Util/Util.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Renders the complete HTML structure for the tools section.
   * @returns {String}
   */
  render() {
    return `
      ${this.render_pixel_size_options()}
      ${this.render_tools()}
      ${this.render_assets()}
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
      {
        id: "pen",
        icon: "pen",
        info: JSON.stringify(["(P) Pen tool"]),
        active: true,
      },
      {
        id: "eraser",
        icon: "eraser",
        info: JSON.stringify(["(E) Eraser tool"]),
      },
      {
        id: "stroke",
        icon: "stroke",
        info: JSON.stringify(["(L) Stroke tool"]),
      },
      { id: "bucket", icon: "bucket", info: JSON.stringify(["(B) Fill tool"]) },
      {
        id: "rectangle",
        icon: "rectangle",
        info: JSON.stringify(["(R) Rectangle tool"]),
      },
      {
        id: "circle",
        icon: "circle",
        info: JSON.stringify(["(C) Circle tool"]),
      },
      {
        id: "rectangle_selection",
        icon: "rectangle_selection",
        info: JSON.stringify(["(T) Rectangle Selection"]),
      },
      {
        id: "irregular_selection",
        icon: "irregular_selection",
        info: JSON.stringify(["(I) Irregular Selection"]),
      },
      {
        id: "shape_selection",
        icon: "fill_shape",
        info: JSON.stringify(["(Q) Shape Selection"]),
      },
    ];

    return `
      <div class="toolbox">
        ${tools.map((tool) => this.create_tool_button(tool)).join("")}
      </div>`;
  }

  /**
   * Creates an HTML button for a tool.
   * @param {Object} tool - Tool object containing id, icon, info, and optional active status.
   * @returns {String}
   */
  create_tool_button(tool) {
    const infoArray = tool.info;
    const isActive = tool.active ? "active" : "";
    return `
      <button id="${tool.id}" class="tool-button ${isActive}" data-tool="${tool.id}" data-info='${infoArray}'>
        <img src="img/icons/${tool.icon}.svg" alt="${tool.id}" />
      </button>`;
  }

  /**
   * Renders and creates the asset buttons.
   * @returns {String}
   */
  render_assets() {
    const assets = [
      "dummy_dirt",
      "dummy_foliage",
      "dummy_lava",
      "dummy_sand",
      "dummy_stone",
      "dummy_water",
      "dummy_tree",
    ];
    return `
      <div class="assetbox">
        ${assets.map((asset) => this.create_asset_button(asset)).join("")}
      </div>`;
  }

  /**
   * Creates an HTML button for an asset.
   * @param {String} asset - Name of the asset.
   * @returns {String}
   */
  create_asset_button(asset) {
    const title = this.capitalize(asset.replace("_", " "));
    return `
      <button class="asset-button" data-asset="${asset}" data-info='["${title} asset"]'>
        <img src="img/assets/${asset}.png" alt="${title}">
      </button>`;
  }

  /**
   * Capitalizes the first letter of a string.
   * @param {String} str
   * @returns {String}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Initializes the event listeners for buttons.
   */
  init() {
    this.setup_tool_buttons();
    this.setup_pixel_size_buttons();
    this.setup_asset_buttons();
  }

  /**
   * Sets up event listeners for tool buttons.
   */
  setup_tool_buttons() {
    const tool_buttons = document.querySelectorAll(".tool-button");
    tool_buttons.forEach((button) => {
      const tool_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, tool_info);

      button.addEventListener("click", () => {
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  /**
   * Sets up event listeners for pixel size buttons.
   */
  setup_pixel_size_buttons() {
    const pixel_size_options = document.querySelectorAll(".pixel-size-option");
    pixel_size_options.forEach((button) => {
      const pixel_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, pixel_info);

      button.addEventListener("click", () => {
        pixel_size_options.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.map_editor.set_pixel_size(Number(button.dataset.size));
      });
    });
  }

  /**
   * Sets up event listeners for asset buttons.
   */
  setup_asset_buttons() {
    const asset_buttons = document.querySelectorAll(".asset-button");
    asset_buttons.forEach((button) => {
      const asset_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, asset_info);

      button.addEventListener("click", () => {
        asset_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const asset_name = button.dataset.asset;
        this.map_editor.selected_asset = `img/assets/${asset_name}.png`;
      });
    });
  }
}

customElements.define("map-editor-tools", MapEditorTools);
