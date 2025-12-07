const { DataTypes } = require("sequelize")
const sequelize = require("../db")
const { v4: uuidv4 } = require("uuid")

const ChatRoom = sequelize.define("ChatRoom", {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
})

module.exports = ChatRoom