import { MapEditorPart } from "./MapEditorPart.js";
import { Util } from "../../../Util/Util.js";
import { BackendClient } from "../../../BackendClient/BackendClient.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
    this.assets = [];
  }

  /**
   * Renders the complete HTML structure for the tools section
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
   * Renders and creates the pixel size options
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
   * Renders and creates the toolbox with all available tools
   * @returns {String}
   */
  render_tools() {
    const tools = [
      // ... (define your tools array here)
    ];

    return `
      <div class="toolbox">
        ${tools.map((tool) => this.create_tool_button(tool)).join("")}
      </div>`;
  }

  /**
   * Creates an HTML button for a tool
   * @param {Object} tool
   * @returns {String}
   */
  create_tool_button(tool) {
    const infoArray = tool.info;
    const isActive = tool.active ? "active" : "";
    return `
      <button id="${tool.id}" class="tool-button ${isActive}" data-tool="${tool.id}" data-info='${JSON.stringify(infoArray)}'>
        <img src="img/icons/${tool.icon}.svg" alt="${tool.id}" />
      </button>`;
  }

  /**
   * Renders and creates the asset buttons.
   * @returns {String}
   */
  render_assets() {
    return `
      <div class="assetbox">
        <!-- Assets will be loaded dynamically -->
      </div>`;
  }

  /**
   * Initializes the event listeners for buttons
   */
  init() {
    this.setup_tool_buttons();
    this.setup_pixel_size_buttons();
  }

  /**
   * Fetches the list of assets from the server and updates the DOM
   */
  async fetch_assets() {
    try {
      const assets = await BackendClient.get_assets();
      this.assets = assets;
      this.update_assets();
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  /**
   * Updates the assets section with the fetched assets.
   */
  update_assets() {
    const assetbox = this.map_editor.querySelector('.assetbox');
    if (!assetbox) {
      console.error('Asset box not found');
      return;
    }
    assetbox.innerHTML = this.assets.map((asset) => this.create_asset_button(asset)).join('');
    this.setup_asset_buttons();
  }

  /**
   * Creates an HTML button for an asset
   * @param {String} asset
   * @returns {String}
   */
  create_asset_button(asset) {
    const title = this.capitalize(asset.replace("_", " ").replace(".png", ""));
    return `
      <button class="asset-button" data-asset="${asset}" title="${title}">
        <img src="http://localhost:3000/uploads/${asset}" alt="${title}">
      </button>`;
  }

  /**
   * Capitalizes the first letter of a string
   * @param {String} str
   * @returns {String}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Sets up event listeners for tool buttons
   */
  setup_tool_buttons() {
    const tool_buttons = this.map_editor.querySelectorAll(".tool-button");
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
   * Sets up event listeners for pixel size buttons
   */
  setup_pixel_size_buttons() {
    const pixel_size_options = this.map_editor.querySelectorAll(".pixel-size-option");
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
   * Sets up event listeners for asset buttons
   */
  setup_asset_buttons() {
    const asset_buttons = this.map_editor.querySelectorAll(".asset-button");
    asset_buttons.forEach((button) => {
      button.addEventListener("click", () => {
        asset_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const asset_name = button.dataset.asset;
        this.map_editor.selected_asset = `http://localhost:3000/uploads/${asset_name}`;
      });
    });
  }

  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this.fetch_assets();
  }
}

customElements.define("map-editor-tools", MapEditorTools);
