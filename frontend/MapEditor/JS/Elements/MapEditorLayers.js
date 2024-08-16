import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
  }

  /**
   * @returns {String}
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
      li.classList.add("layer-item");
      li.setAttribute("data-index", index);

      if (index === activeLayerIndex) {
        li.classList.add("active-layer");
      }
      const layerLabel = document.createElement("span");
      layerLabel.textContent = `Layer ${index + 1}`;
      layerLabel.classList.add("index_label");
      li.appendChild(layerLabel);

      const visibilityButton = document.createElement("button");
      visibilityButton.classList.add("visibility_button");
      const isVisible = this.map_editor.is_layer_visible(index);
      visibilityButton.innerHTML = isVisible
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
      visibilityButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.map_editor.toggle_layer_visibility(index);
        visibilityButton.innerHTML = this.map_editor.is_layer_visible(index)
          ? '<i class="fas fa-eye"></i>'
          : '<i class="fas fa-eye-slash"></i>';
      });
      li.appendChild(visibilityButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete_label");
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.map_editor.remove_layer(index);
      });
      li.appendChild(deleteButton);

      li.addEventListener("click", () => {
        this.map_editor.switch_layer(index);
      });

      layersList.appendChild(li);
    });
  }
}

customElements.define("map-editor-layers", MapEditorLayers);
