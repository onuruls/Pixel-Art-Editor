const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: config.DB_PATH,
  logging: false, // Less noise
});

/**
 * Define the Project, Folder, and File models
 */

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

const Folder = sequelize.define(
  "Folder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_folder_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Folders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    // paranoid: true,
  }
);

const File = sequelize.define(
  "File",
  {
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
      type: DataTypes.ENUM("png", "tmx"),
      allowNull: false,
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    folder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Folders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["name", "type", "folder_id"],
      },
    ],
  }
);

/**
 * Define the relationships between the models
 */
Project.belongsTo(Folder, { as: "rootFolder", foreignKey: "root_folder_id" });

Folder.hasMany(Folder, {
  as: "children",
  foreignKey: "parent_folder_id",
  onDelete: "CASCADE",
});

Folder.belongsTo(Folder, {
  as: "parentFolder",
  foreignKey: "parent_folder_id",
});

Folder.hasMany(File, { foreignKey: "folder_id", onDelete: "CASCADE" });



const initDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized");
  } catch (err) {
    console.error("Database sync failed:", err.message);
    console.error(`To reset the database, delete: ${config.DB_PATH}`);
    console.error("Then restart the application.");
    process.exit(1);
  }
};

module.exports = { sequelize, Project, Folder, File, initDB };
