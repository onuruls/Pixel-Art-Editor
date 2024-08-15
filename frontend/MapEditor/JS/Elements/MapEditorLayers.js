import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  /**
   * Creates an instance of MapEditorLayers
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * Returns the HTML string for the component
   * @returns {String} The HTML string
   */
  render() {
    return `
        <div class="layers-container">
          <ul class="layers-list">
          </ul>
          <div class="add-layer-button">+</div>
        </div>
      `;
  }

  /**
   * Initializes the layers component and sets up event listeners
   */
  init() {
    this.querySelector(".add-layer-button").addEventListener("click", () => {
      this.map_editor.add_layer();
    });
  }

  /**
   * Renders the list of layers in the UI
   * @param {Array} layers
   * @param {number} activeLayerIndex
   */
  renderLayersList(layers, activeLayerIndex) {
    const layersList = this.querySelector(".layers-list");
    layersList.innerHTML = "";

    layers.forEach((layer, index) => {
      const li = document.createElement("li");
      li.textContent = `Layer ${index + 1}`;
      li.classList.add("layer-item");
      if (index === activeLayerIndex) {
        li.classList.add("active-layer");
      }

      li.addEventListener("mousedown", (e) => {
        if (!e.target.classList.contains("delete_label")) {
          this.map_editor.switch_layer(index);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete_label");
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.map_editor.remove_layer(index);
      });

      li.appendChild(deleteButton);
      layersList.appendChild(li);
    });
  }
}

customElements.define("map-editor-layers", MapEditorLayers);
