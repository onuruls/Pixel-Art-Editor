import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
    this.dragging_layer = null;
    this.dragging_layer_index = null;
    this.drop_target_layer = null;
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

  /**
   * Initializes the MapEditorLayers component
   */
  init() {
    this.querySelector(".add-layer-button").addEventListener("click", () => {
      this.map_editor.add_layer();
      this.render_layers_list();
    });
    this.render_layers_list();
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
    li.draggable = true;

    if (index === active_layer_index) {
      li.classList.add("active-layer");
    }

    li.appendChild(this.create_layer_label(index));
    li.appendChild(this.create_visibility_button(index));
    li.appendChild(this.create_delete_button(index));
    li.appendChild(this.create_drag_handle());

    this.attach_drag_events(li, index);

    li.addEventListener("click", (e) => {
      if (!this.is_click_on_action_button(e)) {
        this.map_editor.switch_layer(index);
        this.render_layers_list();
      }
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

    this.update_visibility_button(visibility_button, index);

    visibility_button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handle_visibility_change(index);
    });

    return visibility_button;
  }

  /**
   * Handles the visibility change for a layer
   * @param {number} index
   */
  handle_visibility_change(index) {
    this.map_editor.toggle_layer_visibility(index);
    this.render_layers_list(); // Re-render list to update visibility icons
  }

  /**
   * Updates the visibility button icon based on the layer's visibility
   * @param {HTMLButtonElement} button
   * @param {number} index
   */
  update_visibility_button(button, index) {
    const isVisible = this.map_editor.layer_manager.is_layer_visible(index);
    button.innerHTML = isVisible
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';
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
      this.handle_delete_layer(index);
    });

    return delete_button;
  }

  /**
   * Handles the deletion of a layer
   * @param {number} index
   */
  handle_delete_layer(index) {
    this.map_editor.remove_layer(index);
    this.map_editor.active_layer_index = Math.max(0, index - 1);
    this.render_layers_list(); // Re-render list to reflect the deletion
  }

  /**
   * Creates a drag handle for a layer
   * @returns {HTMLSpanElement}
   */
  create_drag_handle() {
    const dragHandle = document.createElement("span");
    dragHandle.innerHTML =
      '<i class="fa-solid fa-arrows-up-down-left-right"></i>';
    dragHandle.classList.add("drag-handle");
    return dragHandle;
  }

  /**
   * Attaches drag events to a layer list item
   * @param {HTMLLIElement} li
   * @param {number} index
   */
  attach_drag_events(li, index) {
    let isDragging = false;

    li.addEventListener("dragstart", (e) => {
      this.drag_start(e, index);
      isDragging = true;
    });

    li.addEventListener("dragover", (e) => this.drag_over(e, li));
    li.addEventListener("dragleave", () => this.drag_leave(li));
    li.addEventListener("drop", (e) => {
      this.drop(e, index);
      isDragging = false;
    });

    li.addEventListener("dragend", (e) => {
      this.drag_end(e);
      setTimeout(() => {
        isDragging = false;
      }, 0);
    });
  }

  /**
   * Called when dragging starts
   * @param {Event} event
   * @param {number} index
   */
  drag_start(event, index) {
    this.dragging_layer = this.map_editor.layer_manager.layers[index];
    this.dragging_layer_index = index;

    event.dataTransfer.effectAllowed = "move";
  }

  /**
   * Called while dragging over another layer
   * @param {Event} event
   * @param {HTMLElement} targetElement
   */
  drag_over(event, targetElement) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (this.drop_target_layer && this.drop_target_layer !== targetElement) {
      this.drop_target_layer.classList.remove("drop-target");
    }

    this.drop_target_layer = targetElement;
    this.drop_target_layer.classList.add("drop-target");
  }

  /**
   * Called when the drag leaves a layer
   * @param {HTMLElement} targetElement
   */
  drag_leave(targetElement) {
    targetElement.classList.remove("drop-target");
  }

  /**
   * Called when dropping a layer
   * @param {Event} event
   * @param {number} dropIndex
   */
  drop(event, dropIndex) {
    event.preventDefault();

    if (this.dragging_layer_index !== dropIndex) {
      this.map_editor.layer_manager.layers.splice(this.dragging_layer_index, 1);
      this.map_editor.layer_manager.layers.splice(
        dropIndex,
        0,
        this.dragging_layer
      );

      this.render_layers_list();
      this.map_editor.layer_manager.switch_layer(dropIndex);
      this.map_editor.dispatchEvent(new CustomEvent("layers-updated"));
    }

    if (this.drop_target_layer) {
      this.drop_target_layer.classList.remove("drop-target");
    }
  }

  /**
   * Called when dragging ends
   * @param {Event} event
   */
  drag_end(event) {
    this.dragging_layer = null;
    this.dragging_layer_index = null;

    if (this.drop_target_layer) {
      this.drop_target_layer.classList.remove("drop-target");
    }
    this.drop_target_layer = null;
  }

  /**
   * Determines if the click event is on an action button
   * @param {Event} e
   * @returns {boolean}
   */
  is_click_on_action_button(e) {
    return e.target.closest("button") !== null;
  }
}

customElements.define("map-editor-layers", MapEditorLayers);
