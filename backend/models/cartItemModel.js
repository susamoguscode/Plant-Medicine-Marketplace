const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const CartItem = sequelize.define("CartItem", {
    userId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
})

CartItem.sync()
    .then(() => console.log("CartItem model synced with DB"))
    .catch((err) => console.log("Error syncing cart item model:", err))

module.exports = CartItem