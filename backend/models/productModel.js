const { DataTypes } = require("sequelize")
const sequelize = require("../db")
const { v4: uuidv4 } = require("uuid")

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    diseaseTargets: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    usageInstructions: { type: DataTypes.TEXT },
    ingredients: { type: DataTypes.TEXT },
    sellerId: { type: DataTypes.UUID, allowNull: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0.0 },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 }
})

Product.sync({ alter: true })
    .then(() => console.log("Product model synced with DB"))
    .catch(err => console.log("Error syncing user model:", err))

module.exports = Product