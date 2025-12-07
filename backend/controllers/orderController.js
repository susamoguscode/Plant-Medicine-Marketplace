const Product = require("../models/productModel")
const Order = require("../models/orderModel")
const OrderItem = require("../models/orderItemModel")
const User = require("../models/userModel")

const createOrder = async (req, res) => {
    const userId = req.user.id
    const { items, totalPrice, paymentMethod } = req.body

    try {
        const order = await Order.create({ userId, totalPrice, paymentMethod })

        await Promise.all(items.map(async item => {
            const product = await Product.findByPk(item.productId)
            if (product) {
                await order.addProduct(product, {
                    through: {
                        quantity: item.quantity,
                        priceAtPurchase: item.price
                    }
                })
            }
        }))


        res.status(201).json({ message: "Order created", orderId: order.id })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to create order", error: err.message })
    }
}

const getOrderHistory = async (req, res) => {
    const userId = req.user.id

    try {
        const orders = await Order.findAll({
            where: { userId },
            include: {
                model: Product,
                as: "products",
                through: { attributes: ["quantity", "priceAtPurchase", "status"] },
                attributes: ["id", "name", "price", "imageUrl"]
            },
            order: [["createdAt", "DESC"]]
        })

        res.status(200).json({ data: orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch order history", error: err.message })
    }
}

const getSellerPendingOrders = async (req, res) => {
    const sellerId = req.user.id
    if (req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage their incoming orders" })

    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: "orderItems",
                    where: { status: "pending" },
                    include: [
                        {
                            model: Product,
                            as: "product",
                            where: { sellerId: sellerId },
                            attributes: ["id", "name", "price", "imageUrl"]
                        }
                    ],
                    attributes: ["quantity", "priceAtPurchase", "status"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "imageUrl"]
                }
            ],
            order: [["createdAt", "DESC"]]
        })

        res.status(200).json({ data: orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch seller orders", error: err.message })
    }
}

const acceptOrderItem = async (req, res) => {
    const { orderId, productId } = req.params
    const sellerId = req.user.id

    if(req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage orders" })

    try {
        const product = await Product.findByPk(productId)
        if (!product || product.sellerId !== sellerId) return res.status(403).json({ message: "Unauthorized or product not found" })

        const orderItem = await OrderItem.findOne({
            where: { orderId, productId },
            include: {
                model: Product,
                as: "product"
            }
        })

        if (!orderItem || orderItem.status !== "pending") return res.status(400).json({ message: "Invalid or already processed item" })

        if (product.stock < orderItem.quantity) return res.status(400).json({ message: "Not enough stock" })

        const order = await Order.findByPk(orderId)
        if (!order) return res.status(404).json({ message: "Order not found" })

        const buyer = await User.findByPk(order.userId)
        if (!buyer) return res.status(404).json({ message: "Buyer not found" })

        const seller = await User.findByPk(product.sellerId)
        if (!seller) return res.status(404).json({ message: "Seller not found" })

        const totalCost = orderItem.quantity * orderItem.priceAtPurchase
        if (buyer.money < totalCost) return res.status(400).json({ message: "Buyer has insufficient balance" })
        
        buyer.money -= totalCost
        await buyer.save()

        seller.money += totalCost
        await seller.save()

        product.stock -= orderItem.quantity
        await product.save()

        orderItem.status = "completed"
        await orderItem.save()

        res.json({ message: "Order accepted, stock and balance updated" }) 
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to accept order", error: err.message })
    }
}

const cancelOrderItem = async (req, res) => {
    const { orderId, productId } = req.params
    const sellerId = req.user.id

    if(req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage orders" })

    try {
        const product = await Product.findByPk(productId)
        if (!product || product.sellerId !== sellerId) return res.status(403).json({ message: "Unauthorized or product not found" })
        
        const orderItem = await OrderItem.findOne({ where: { orderId, productId } })
        if (!orderItem || orderItem.status !== "pending") return res.status(400).json({ message: "Invalid or already processed item" })

        orderItem.status = "canceled"
        await orderItem.save()

        res.json({ message: "Order canceled" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to cancel order", error: err.message })
    }
}

module.exports = {
    createOrder,
    getOrderHistory,
    getSellerPendingOrders,
    cancelOrderItem,
    acceptOrderItem
}