import { MapEditorPart } from "./MapEditorPart.js";

export class MapEditorLayers extends MapEditorPart {
  /**
   * @param {MapEditor} map_editor
   */
  constructor(map_editor) {
    super(map_editor);
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
    const { layers, active_layer_index } = this.map_editor.layer_manager;
    const layersList = this.querySelector(".layers-list");
    layersList.innerHTML = "";

    layers.forEach((layer, index) => {
      layersList.appendChild(
        this.create_layer_list_item(index, active_layer_index)
      );
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
    li.className = `layer-item${
      index === active_layer_index ? " active-layer" : ""
    }`;
    li.dataset.index = index;
    li.draggable = true;

    li.append(
      this.create_layer_label(index),
      this.create_visibility_button(index),
      this.create_delete_button(index),
      this.create_drag_handle()
    );

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
    return this.create_element("span", `Layer ${index + 1}`, "index_label");
  }

  /**
   * Creates a visibility toggle button for a layer
   * @param {number} index
   * @returns {HTMLButtonElement}
   */
  create_visibility_button(index) {
    const button = this.create_element("button", "", "visibility_button");
    this.update_visibility_button(button, index);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handle_visibility_change(index);
    });

    return button;
  }

  /**
   * Handles the visibility change for a layer
   * @param {number} index
   */
  handle_visibility_change(index) {
    this.map_editor.toggle_layer_visibility(index);
    this.render_layers_list();
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
    const isDeletable = this.map_editor.layer_manager.layers.length > 1;
    const button = this.create_element(
      "button",
      '<i class="fas fa-trash-alt"></i>',
      "delete_label"
    );

    if (!isDeletable) {
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    } else {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handle_delete_layer(index);
      });
    }

    return button;
  }

  /**
   * Handles the deletion of a layer
   * @param {number} index
   */
  handle_delete_layer(index) {
    const { layers, active_layer_index } = this.map_editor.layer_manager;

    this.map_editor.remove_layer(index);

    if (index === active_layer_index) {
      this.map_editor.layer_manager.active_layer_index = Math.max(0, index - 1);
    } else if (index < active_layer_index) {
      this.map_editor.layer_manager.active_layer_index--;
    }

    this.render_layers_list();
  }

  /**
   * Creates a drag handle for a layer
   * @returns {HTMLSpanElement}
   */
  create_drag_handle() {
    return this.create_element(
      "span",
      '<i class="fa-solid fa-arrows-up-down-left-right"></i>',
      "drag-handle"
    );
  }

  /**
   * Attaches drag events to a layer list item
   * @param {HTMLLIElement} li
   * @param {number} index
   */
  attach_drag_events(li, index) {
    li.addEventListener("dragstart", (e) => this.drag_start(e, index));
    li.addEventListener("dragover", (e) => this.drag_over(e, li));
    li.addEventListener("dragleave", () => this.drag_leave(li));
    li.addEventListener("drop", (e) => this.drop(e, index));
    li.addEventListener("dragend", () => this.drag_end());
  }

  /**
   * Called when dragging starts
   * @param {Event} event
   * @param {number} index
   */
  drag_start(event, index) {
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
      this.swap_layers(this.dragging_layer_index, dropIndex);

      this.render_layers_list();
      this.map_editor.layer_manager.switch_layer(dropIndex);
      this.map_editor.dispatchEvent(new CustomEvent("layers-updated"));
    }

    if (this.drop_target_layer) {
      this.drop_target_layer.classList.remove("drop-target");
    }
  }

  /**
   * Swaps two layers and their associated canvases
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  swap_layers(fromIndex, toIndex) {
    this.map_editor.layer_manager.swap_layers(fromIndex, toIndex);
    const layer_canvases = this.map_editor.map_canvas.layer_canvases;

    [layer_canvases[fromIndex], layer_canvases[toIndex]] = [
      layer_canvases[toIndex],
      layer_canvases[fromIndex],
    ];

    this.map_editor.map_canvas.rearrange_layer_canvases(fromIndex, toIndex);
  }

  /**
   * Called when dragging ends
   */
  drag_end() {
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

  /**
   * Helper method to create an HTML element with optional classes and innerHTML
   * @param {string} tag
   * @param {string} innerHTML
   * @param {string} className
   * @returns {HTMLElement}
   */
  create_element(tag, innerHTML = "", className = "") {
    const element = document.createElement(tag);
    element.innerHTML = innerHTML;
    if (className) element.className = className;
    return element;
  }
}

customElements.define("map-editor-layers", MapEditorLayers);
