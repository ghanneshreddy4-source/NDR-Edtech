// models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        if (typeof value === "string") {
          this.setDataValue("email", value.toLowerCase().trim());
        } else {
          this.setDataValue("email", value);
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "admin"),
      defaultValue: "student",
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
  }
);

// Hash on create (if not already hashed)
User.beforeCreate(async (user) => {
  if (user.password && !user.password.startsWith("$2")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hash on update if password changed
User.beforeUpdate(async (user) => {
  if (user.changed("password") && user.password && !user.password.startsWith("$2")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare password
User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
