const { DataTypes } = require("sequelize")
const sequelize = require("../db")
const { v4: uuidv4 } = require("uuid")

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
})

module.exports = Message