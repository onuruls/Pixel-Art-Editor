export class FileContextMenuHandler {
  /**
   * @constructor
   * @param {FileAreaView} file_area_view
   */
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
    this.context_menu_factory = this.file_area_view.context_menu_factory;
  }

  /**
   * Handles right-clicks to show the context menu.
   * @param {MouseEvent} event
   */
  handle_context_menu(event) {
    event.preventDefault();
    const target = event.target.closest(".item");
    if (
      target &&
      !this.file_area_view.selection_handler.selected_items.has(target)
    ) {
      this.file_area_view.selection_handler.select_item(target);
    }
    const context_menu = this.context_menu_factory.getContextMenu(
      this.file_area_view.selection_handler.selected_items
    );
    context_menu.show(event);

    document.addEventListener("click", () => context_menu.hide(), {
      once: true,
    });
  }
}
