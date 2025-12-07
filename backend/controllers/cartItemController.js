const CartItem = require("../models/cartItemModel")
const Product = require("../models/productModel")

const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body
    const userId = req.user.id

    try {
        const product = await Product.findByPk(productId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        if (product.sellerId === userId) return res.status(403).json({ message: "Cannot add your own product to cart" })

        if (product.stock < quantity) return res.status(400).json({ message: "Stock exceeded" })

        const [cartItem, created] = await CartItem.findOrCreate({
            where: { userId, productId },
            defaults: { quantity }
        })

        if (!created) {
            if (cartItem.quantity + quantity > product.stock) return res.status(400).json({ message: "Exceeds stock" })
            cartItem.quantity += quantity
            await cartItem.save()
        }

        res.status(200).json(cartItem)
    } catch (err) {
        res.status(500).json({ message: "Add to cart failed", error: err.message })
    }
}

const getCart = async (req, res) => {
    try {
        const userId = req.user.id
        const items = await CartItem.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "imageUrl", "stock", "sellerId"]
                }
            ]
        })
        res.json({ data: items })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch cart", error: err.message })
    }
}

const clearCheckedItems = async (req, res) => {
    try {
        const userId = req.user.id
        const { productIds } = req.body

        await CartItem.destroy({
            where: {
                userId,
                productId: productIds
            }
        })

        res.json({ message: "Checked-out items cleared" })
    } catch (err) {
        res.status(500).json({ message: "Failed to clear cart items", error: err.message })
    }
}

const updateItem = async (req, res) => {
    const { quantity } = req.body

    try {
        const item = await CartItem.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "imageUrl", "stock"]
                }
            ]
        })
        if (!item) return res.status(404).json({ message: "Cart item not found" })

        if (quantity <= 0 || quantity > item.product.stock) return res.status(400).json({ message: "Invalid quantity" })

        item.quantity = quantity
        await item.save()
        res.json(item)
    } catch (err) {
        res.status(500).json({ message: "Failed to update item", error: err.message })
    }
}
const clearSingleItem = async (req, res) => {
    try {
        const item = await CartItem.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!item) return res.status(404).json({ message: "Cart item not found" })

        await item.destroy()
        res.json({ message: "Cart item deleted" })
    } catch (err) {
        res.status(500).json({ message: "Failed to delete cart item", error: err.message })
    }
}

module.exports = {
    addToCart,
    clearCheckedItems,
    getCart,
    updateItem,
    clearSingleItem
}