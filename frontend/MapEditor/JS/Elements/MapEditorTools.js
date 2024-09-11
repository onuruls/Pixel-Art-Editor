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
      <div class="toolbox">
        <button id="pen" class="tool-button active" data-tool="pen" title="Pen tool"><img src="img/icons/pen.svg" alt="Pen"></button>
        <button id="eraser" class="tool-button" data-tool="eraser" title="Eraser tool"><img src="img/icons/eraser.svg" alt="Eraser"></button>
        <button id="zoom-in" class="tool-button zoom-tool" data-tool="zoom-in" title="Zoom In tool"><img src="img/icons/zoom_in.svg" alt="Zoom In"></button>
        <button id="zoom-out" class="tool-button zoom-tool" data-tool="zoom-out" title="Zoom Out tool"><img src="img/icons/zoom_out.svg" alt="Zoom Out"></button>
        <button id="stroke" class="tool-button" data-tool="stroke" title="Stroke tool"><img src="img/icons/stroke.svg" alt="Stroke"></button>
        <button id="bucket" class="tool-button" data-tool="bucket" title="Fill tool"><img src="img/icons/bucket.svg" alt="Fill"></button>
        <button id="rectangle" class="tool-button" data-tool="rectangle" title="Rectangle tool"><img src="img/icons/rectangle.svg" alt="Rectangle"></button>
        <button id="circle" class="tool-button" data-tool="circle" title="Circle tool"><img src="img/icons/circle.svg" alt="Circle"></button>
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
