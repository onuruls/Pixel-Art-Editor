import { FileAreaView } from "../../Elements/FileAreaView.js";

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
   *
   * @param {MouseEvent} event
   */
  handle_click(event) {
    const target = event.target.closest(".item");

    if (!target) {
      this.clear_selection();
      return;
    }

    if (event.ctrlKey && event.button === 0) {
      this.toggle_item_selection(target);
    } else {
      this.clear_selection();
      this.select_item(target);
    }
  }

  /**
   * Toggles the selection state of an item.
   *
   * @param {HTMLElement} target
   */
  toggle_item_selection(target) {
    if (this.selected_items.has(target)) {
      this.deselect_item(target);
    } else {
      this.select_item(target);
    }
  }

  /**
   * Selects an item and adds it to the selection.
   *
   * @param {HTMLElement} target
   */
  select_item(target) {
    if (!target.id) return;

    this.selected_items.add(target);
    target.classList.add("selected");
    this.update_file_area_selection();
  }

  /**
   * Deselects an item and removes it from the selection.
   *
   * @param {HTMLElement} target
   */
  deselect_item(target) {
    this.selected_items.delete(target);
    target.classList.remove("selected");
    this.update_file_area_selection();
  }

  /**
   * Clears the current selection of items.
   */
  clear_selection() {
    this.selected_items.forEach((item) => item.classList.remove("selected"));
    this.selected_items.clear();
    this.update_file_area_selection();
  }

  /**
   * Updates the file area view with the current selection.
   */
  update_file_area_selection() {
    this.file_area_view.selected_items = this.selected_items;
  }

  /**
   * Checks if there are any selected items.
   *
   * @returns {boolean}
   */
  has_selected_items() {
    return this.selected_items.size > 0;
  }
}
