const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "database.db"),
});

/**
 * Define the Project, Folder, and File models.
 */

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Folder = sequelize.define("Folder", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const File = sequelize.define("File", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
  },
});

/**
 * Define the relationships between the models.
 */

Project.belongsTo(Folder, { as: "rootFolder", foreignKey: "root_folder_id" });
Folder.hasMany(Folder, { as: "children", foreignKey: "folder_id" });
Folder.hasMany(File, { foreignKey: "folder_id" });
Folder.belongsTo(Folder, { as: "parentFolder", foreignKey: "folder_id" });

sequelize.sync();

module.exports = { sequelize, Project, Folder, File };
