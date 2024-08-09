import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorTools extends MapEditorPart {
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the Html-String
   * @returns {String}
   */
  render() {
    return `
      <h1 id="title">Map Editor</h1>
      <div class="toolbox">
        <button id="pen" class="tool-button active" data-tool="pen" title="Pen tool"><img src="img/icons/pen.svg" alt="Pen"></button>
        <button id="zoom-in" class="tool-button zoom-tool" data-tool="zoom-in" title="Zoom In tool"><img src="img/icons/zoom_in.svg" alt="Zoom In"></button>
        <button id="zoom-out" class="tool-button zoom-tool" data-tool="zoom-out" title="Zoom Out tool"><img src="img/icons/zoom_out.svg" alt="Zoom Out"></button>
      </div>
      <div class="assetbox">
        ${this.renderAssetButtons()}
      </div>
    `;
  }

  renderAssetButtons() {
    const assets = [
      "dummy_dirt",
      "dummy_foliage",
      "dummy_lava",
      "dummy_sand",
      "dummy_stone",
      "dummy_water",
      "dummy_tree",
    ];

    return assets
      .map(
        (asset) =>
          `<button class="asset-button" data-asset="${asset}" title="${this.capitalize(
            asset.replace("_", " ")
          )} asset"><img src="img/assets/${asset}.png" alt="${this.capitalize(
            asset.replace("_", " ")
          )}"></button>`
      )
      .join("");
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  init() {
    this.initToolButtons();
    this.initAssetButtons();
  }

  initToolButtons() {
    const tool_buttons = document.querySelectorAll(".tool-button");
    tool_buttons.forEach((button) => {
      button.addEventListener("click", () => {
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  initAssetButtons() {
    const asset_buttons = document.querySelectorAll(".asset-button");
    asset_buttons.forEach((button) => {
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
