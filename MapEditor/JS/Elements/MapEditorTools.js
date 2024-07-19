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
      </div>
      <div class="assetbox">
        <button class="asset-button" title="Dirt asset"><img src="img/assets/dummy_dirt.png" alt="Dummy Dirt"></button>
        <button class="asset-button" title="Foliage asset"><img src="img/assets/dummy_foliage.png" alt="Dummy Foliage"></button>
        <button class="asset-button" title="Lava asset"><img src="img/assets/dummy_lava.png" alt="Dummy Lava"></button>
        <button class="asset-button" title="Sand asset"><img src="img/assets/dummy_sand.png" alt="Dummy Sand"></button>
        <button class="asset-button" title="Stone asset"><img src="img/assets/dummy_stone.png" alt="Dummy Stone"></button>
        <button class="asset-button" title="Water asset"><img src="img/assets/dummy_water.png" alt="Dummy Water"></button>
        <button class="asset-button" title="Tree asset"><img src="img/assets/dummy_tree.png" alt="Dummy Tree"></button>
      </div>
    `;
  }

  init() {
    const toolButtons = document.querySelectorAll(".tool-button");
    toolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        toolButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });

    const assetButtons = document.querySelectorAll(".asset-button");
    assetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        assetButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }
}

customElements.define("map-editor-tools", MapEditorTools);
