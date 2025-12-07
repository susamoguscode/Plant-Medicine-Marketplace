const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const PaymentMethod = sequelize.define("PaymentMethod", {
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
})

module.exports = PaymentMethod