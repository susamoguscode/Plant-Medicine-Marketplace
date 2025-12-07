const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const TopUpRequest = sequelize.define("TopUpRequest", {
    userId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.FLOAT, validate: { min: 1 }, allowNull: false },
    status : {
        type: DataTypes.ENUM("pending", "accepted", "declined"),
        defaultValue: "pending"
    }
})

TopUpRequest.sync()
    .then(() => console.log("TopUpRequest model synced with DB"))
    .catch((err) => console.log("Error syncing review model:", err))

module.exports = TopUpRequest