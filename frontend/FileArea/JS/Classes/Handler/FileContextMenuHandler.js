export class FileContextMenuHandler {
  /**
   * Handles the context menu in the file area.
   *
   * @param {FileAreaView} file_area_view
   */
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
    this.context_menu_factory = this.file_area_view.context_menu_factory;
  }

  /**
   * Handles right-clicks to show the context menu.
   *
   * @param {MouseEvent} event
   */
  handle_context_menu(event) {
    event.preventDefault();

    const target = this.get_target_item(event);

    if (target && !this.is_item_selected(target)) {
      this.select_target_item(target);
    }

    const context_menu = this.create_context_menu();
    context_menu.show(event);

    this.add_hide_context_menu_listener(context_menu);
  }

  /**
   * Gets the target item from the event.
   *
   * @param {MouseEvent} event
   * @returns {HTMLElement|null}
   */
  get_target_item(event) {
    return event.target.closest(".item");
  }

  /**
   * Checks if the target item is already selected.
   *
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  is_item_selected(target) {
    return this.file_area_view.selection_handler.selected_items.has(target);
  }

  /**
   * Selects the target item.
   *
   * @param {HTMLElement} target
   */
  select_target_item(target) {
    this.file_area_view.selection_handler.select_item(target);
  }

  /**
   * Creates the context menu for the selected items.
   *
   * @returns {ContextMenu}
   */
  create_context_menu() {
    return this.context_menu_factory.getContextMenu(
      this.file_area_view.selection_handler.selected_items
    );
  }

  /**
   * Adds a listener to hide the context menu on the next click.
   *
   * @param {ContextMenu} context_menu
   */
  add_hide_context_menu_listener(context_menu) {
    document.addEventListener("click", () => context_menu.hide(), {
      once: true,
    });
  }
}
