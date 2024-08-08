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
        <button class="asset-button" data-asset="dummy_dirt" title="Dirt asset"><img src="img/assets/dummy_dirt.png" alt="Dummy Dirt"></button>
        <button class="asset-button" data-asset="dummy_foliage" title="Foliage asset"><img src="img/assets/dummy_foliage.png" alt="Dummy Foliage"></button>
        <button class="asset-button" data-asset="dummy_lava" title="Lava asset"><img src="img/assets/dummy_lava.png" alt="Dummy Lava"></button>
        <button class="asset-button" data-asset="dummy_sand" title="Sand asset"><img src="img/assets/dummy_sand.png" alt="Dummy Sand"></button>
        <button class="asset-button" data-asset="dummy_stone" title="Stone asset"><img src="img/assets/dummy_stone.png" alt="Dummy Stone"></button>
        <button class="asset-button" data-asset="dummy_water" title="Water asset"><img src="img/assets/dummy_water.png" alt="Dummy Water"></button>
        <button class="asset-button" data-asset="dummy_tree" title="Tree asset"><img src="img/assets/dummy_tree.png" alt="Dummy Tree"></button>
      </div>
    `;
  }

  init() {
    const tool_buttons = document.querySelectorAll(".tool-button");
    tool_buttons.forEach((button) => {
      button.addEventListener("click", () => {
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });

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
