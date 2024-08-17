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
        <ul class="layers-list"></ul>
        <div class="add-layer-button">+</div>
      </div>
    `;
  }

  init() {
    this.querySelector(".add-layer-button").addEventListener("click", () => {
      this.map_editor.add_layer();
      this.render_layers_list();
    });
  }

  /**
   * Renders the list of layers in the UI
   */
  render_layers_list() {
    const layers = this.map_editor.layer_manager.layers;
    const active_layer_index = this.map_editor.active_layer_index;
    const layersList = this.querySelector(".layers-list");
    layersList.innerHTML = "";

    layers.forEach((layer, index) => {
      const li = this.create_layer_list_item(index, active_layer_index);
      layersList.appendChild(li);
    });
  }

  /**
   * Creates a list item for a layer
   * @param {number} index
   * @param {number} active_layer_index
   * @returns {HTMLLIElement}
   */
  create_layer_list_item(index, active_layer_index) {
    const li = document.createElement("li");
    li.classList.add("layer-item");
    li.setAttribute("data-index", index);

    if (index === active_layer_index) {
      li.classList.add("active-layer");
    }

    li.appendChild(this.create_layer_label(index));
    li.appendChild(this.create_visibility_button(index));
    li.appendChild(this.create_delete_button(index));

    li.addEventListener("click", () => {
      this.map_editor.switch_layer(index);
      this.render_layers_list();
    });

    return li;
  }

  /**
   * Creates a label for a layer
   * @param {number} index
   * @returns {HTMLSpanElement}
   */
  create_layer_label(index) {
    const layerLabel = document.createElement("span");
    layerLabel.textContent = `Layer ${index + 1}`;
    layerLabel.classList.add("index_label");
    return layerLabel;
  }

  /**
   * Creates a visibility toggle button for a layer
   * @param {number} index
   * @returns {HTMLButtonElement}
   */
  create_visibility_button(index) {
    const visibility_button = document.createElement("button");
    visibility_button.classList.add("visibility_button");

    const isVisible = this.map_editor.layer_manager.is_layer_visible(index);
    visibility_button.innerHTML = isVisible
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';

    visibility_button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.map_editor.toggle_layer_visibility(index);
      visibility_button.innerHTML =
        this.map_editor.layer_manager.is_layer_visible(index)
          ? '<i class="fas fa-eye"></i>'
          : '<i class="fas fa-eye-slash"></i>';
    });

    return visibility_button;
  }

  /**
   * Creates a delete button for a layer
   * @param {number} index
   * @returns {HTMLButtonElement}
   */
  create_delete_button(index) {
    const delete_button = document.createElement("button");
    delete_button.classList.add("delete_label");

    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-trash-alt");
    delete_button.appendChild(icon);

    delete_button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.map_editor.remove_layer(index);
      this.render_layers_list();
    });

    return delete_button;
  }
}

customElements.define("map-editor-layers", MapEditorLayers);
