const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const Review = sequelize.define("Review", {
    userId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT },
})

Review.sync()
    .then(() => console.log("Review model synced with DB"))
    .catch((err) => console.log("Error syncing review model:", err))

module.exports = Review