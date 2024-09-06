export class FileSelectionHandler {
  /**
   * Handles selection of files and folders in the FileAreaView.
   * @param {FileAreaView} file_area_view
   */
  constructor(file_area_view) {
    this.file_area_view = file_area_view;
    this.selected_items = new Set();
  }

  /**
   * Handles left-clicks to select or deselect items.
   * @param {MouseEvent} event
   */
  handle_click(event) {
    const target = event.target.closest(".item");

    if (target) {
      if (event.ctrlKey && event.button === 0) {
        this.toggle_item_selection(target);
      } else {
        this.clear_selection();
        this.select_item(target);
      }
    } else {
      this.clear_selection();
    }
  }

  /**
   * Toggles the selection state of an item.
   * @param {HTMLElement} target
   */
  toggle_item_selection(target) {
    if (this.selected_items.has(target)) {
      this.selected_items.delete(target);
      target.classList.remove("selected");
    } else {
      this.selected_items.add(target);
      target.classList.add("selected");
    }
  }

  /**
   * Clears the current selection of items.
   */
  clear_selection() {
    this.selected_items.forEach((item) => item.classList.remove("selected"));
    this.selected_items.clear();
  }

  /**
   * Highlights the selected item and updates the file area selection.
   * @param {HTMLElement} target
   */
  select_item(target) {
    const id = target.id;
    if (id === undefined) {
      return;
    }
    this.selected_items.add(target);
    target.classList.add("selected");
    this.file_area_view.selected_items = this.selected_items;
  }

  /**
   * Checks if there are any selected items.
   * @returns {boolean}
   */
  has_selected_items() {
    return this.selected_items.size > 0;
  }
}
