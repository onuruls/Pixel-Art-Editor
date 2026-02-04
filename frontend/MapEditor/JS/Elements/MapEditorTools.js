import { MapEditorPart } from "./MapEditorPart.js";
import { Util } from "../../../Util/Util.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
    this.map_editor = map_editor;
    this.assets = [];
    this.dummy_assets = [
      "dummy_dirt",
      "dummy_foliage",
      "dummy_lava",
      "dummy_sand",
      "dummy_stone",
      "dummy_water",
      "dummy_tree",
    ];
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
    return `
      <div class="assetbox">
        <!-- Assets will be loaded here dynamically -->
      </div>`;
  }

  /**
   * Initializes the event listeners for buttons.
   */
  init() {
    this.setup_tool_buttons();
    this.setup_pixel_size_buttons();
    this.fetch_assets();
  }

  /**
   * Fetches the list of assets from the server and updates the DOM.
   */
  async fetch_assets() {
    try {
      const response = await fetch("/api/sprites");
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.statusText}`);
      }
      const sprites = await response.json();
      // Convert sprite objects to our unified format
      const spriteAssets = sprites.map((s) => ({
        name: s.name,
        filename: s.filename,
        isDummy: false,
      }));
      // Dummy assets use their string name as both name and filename
      const dummyAssets = this.dummy_assets.map((d) => ({
        name: d.replace("dummy_", "").replace("_", " "),
        filename: d,
        isDummy: true,
      }));
      this.assets = [...dummyAssets, ...spriteAssets];
      await this.preload_assets();

      this.update_assets();
    } catch (error) {
      console.error("Error fetching assets:", error);
      this.assets = this.dummy_assets.map((d) => ({
        name: d.replace("dummy_", "").replace("_", " "),
        filename: d,
        isDummy: true,
      }));
      await this.preload_assets();
      this.update_assets();
    }
  }

  /**
   * Preloads fetched assets
   * @returns {Promise}
   */
  preload_assets() {
    const assetUrls = this.assets.map((asset) => {
      if (asset.isDummy) {
        return `img/assets/${asset.filename}.png`;
      } else {
        return `/uploads/${asset.filename}`;
      }
    });
    return this.map_editor.load_assets(assetUrls);
  }

  /**
   * Updates the assets section with the fetched assets.
   */
  update_assets() {
    const assetbox = this.map_editor.querySelector(".assetbox");
    if (!assetbox) {
      console.error("Asset box not found");
      return;
    }
    assetbox.innerHTML = this.assets
      .map((asset) => this.create_asset_button(asset))
      .join("");
    this.setup_asset_buttons();
  }

  /**
   * Creates an HTML button for an asset.
   * @param {Object} asset - Asset object with name, filename, isDummy.
   * @returns {String}
   */
  create_asset_button(asset) {
    const title = this.capitalize(asset.name);
    let img_src = "";
    if (asset.isDummy) {
      img_src = `img/assets/${asset.filename}.png`;
    } else {
      img_src = `/uploads/${asset.filename}`;
    }
    return `
      <button class="asset-button" data-asset="${asset.filename}" data-isdummy="${asset.isDummy}" data-info='["${title} asset"]'>
        <img src="${img_src}" alt="${title}">
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
   * Sets up event listeners for tool buttons.
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
   * Sets up event listeners for pixel size buttons.
   */
  setup_pixel_size_buttons() {
    const pixel_size_options =
      this.map_editor.querySelectorAll(".pixel-size-option");
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
    const asset_buttons = this.map_editor.querySelectorAll(".asset-button");
    asset_buttons.forEach((button) => {
      const asset_info = JSON.parse(button.getAttribute("data-info"));
      Util.create_tool_info(button, asset_info);

      button.addEventListener("click", () => {
        asset_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const asset_filename = button.dataset.asset;
        const isDummy = button.dataset.isdummy === "true";
        let asset_url = "";
        if (isDummy) {
          asset_url = `img/assets/${asset_filename}.png`;
        } else {
          asset_url = `/uploads/${asset_filename}`;
        }

        if (this.map_editor.image_cache[asset_url]) {
          this.map_editor.selected_asset = asset_url;
        } else {
          console.error(`Asset not preloaded: ${asset_url}`);
        }
      });
    });
  }
}

customElements.define("map-editor-tools", MapEditorTools);
