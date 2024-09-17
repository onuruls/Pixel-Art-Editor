const { File, Folder } = require("../db");

async function generate_unique_name(parent_id, name, is_file, type = null) {
  let unique_name = name;
  let counter = 1;
  let is_unique = false;

  while (!is_unique) {
    let existing_item;
    if (is_file) {
      existing_item = await File.findOne({
        where: { name: unique_name, folder_id: parent_id, type },
      });
    } else {
      existing_item = await Folder.findOne({
        where: { name: unique_name, parent_folder_id: parent_id },
      });
    }

    if (!existing_item) {
      is_unique = true;
    } else {
      unique_name = `${name} (${counter})`;
      counter++;
    }
  }

  return unique_name;
}

module.exports = { generate_unique_name };
