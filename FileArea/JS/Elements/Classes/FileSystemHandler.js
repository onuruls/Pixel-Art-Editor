import { FileAreaView } from "../FileAreaView.js";

export class FileSystemHandler {
  /**
   *
   * @param {FileAreaView} file_area_view
   * @param {FileSystemDirectoryHandle} fsd_handle
   */
  constructor(file_area_view, fsd_handle) {
    this.file_area_view = file_area_view;
    this.fsd_handle = fsd_handle;
    this.fsd_histroy = [this.fsd_handle];
    this.entries = [];
    this.read_directory_content().then((entries) => {
      this.entries = entries;
      this.file_area_view.rebuild_view();
    });
  }

  /**
   * Reads the content of the current
   * FileSystemDirectoryHandle
   * @returns {Promise}
   */
  async read_directory_content() {
    const entries = [];
    for await (const entry of this.fsd_handle.values()) {
      entries.push({ kind: entry.kind, name: entry.name });
    }
    return entries;
  }

  /**
   * Decides if the user moves up or down the filesystem
   * @param {String} name
   */
  change_directory_handle(name) {
    if (name === "..") {
      this.load_prev_directory();
    } else {
      this.load_new_directory(name);
    }
  }

  /**
   * Reloads the prev fsd_handle and updates UI
   */
  load_prev_directory() {
    this.fsd_histroy.pop();
    this.fsd_handle = this.fsd_histroy[this.fsd_histroy.length - 1];
    this.read_directory_content()
      .then((entries) => {
        this.entries = entries;
        this.file_area_view.rebuild_view();
      })
      .catch((error) => console.log("Error retrieving handle data"));
  }

  /**
   * Gets new FileSystemDirectoryHandle,
   * fetches directory data and command file_area_view to rebuild
   * @param {String} name
   */
  load_new_directory(name) {
    this.fsd_handle
      .getDirectoryHandle(name)
      .then((new_handle) => {
        this.fsd_handle = new_handle;
        this.fsd_histroy.push(new_handle);
        this.read_directory_content()
          .then((entries) => {
            this.entries = entries;
            this.file_area_view.rebuild_view();
          })
          .catch((error) => console.log("Error retrieving handle data"));
      })
      .catch((error) => console.log("Error getting new handle"));
  }
}
