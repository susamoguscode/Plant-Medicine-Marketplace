const { DataTypes } = require("sequelize")
const sequelize = require("../db")
const { v4: uuidv4 } = require("uuid")

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM("user", "seller", "admin"), defaultValue: "user" },
    googleId: { type: DataTypes.STRING },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "/uploads/users/default.jpg"
    },
    money: { type: DataTypes.FLOAT, defaultValue: 0.0, allowNull: false }
})

User.sync({ alter: true })
    .then(() => console.log("User model synced with DB"))
    .catch(err => console.log("Error syncing user model:", err))

module.exports = User