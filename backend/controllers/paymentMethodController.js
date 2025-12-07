const PaymentMethod = require("../models/paymentMethodModel")

const getAllMethods = async (req, res) => {
    const methods = await PaymentMethod.findAll()
    res.json({ data: methods })
}

const addMethod = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can add payment methods" })

    const { name } = req.body
    if (!name) return res.status(400).json({ message: "Invalid name" })
    
    try {
        const method = await PaymentMethod.create({ name })
        res.status(201).json({ data: method })
    } catch (err) {
        console.error("Error creating payment method:", err)
        res.status(500).json({ message: "Failed to create payment method", error: err.message })
    }
}

const removeMethod = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can add payment methods" })

    const { id } = req.params
    
    try {
        const method = await PaymentMethod.findByPk(id)
        if (!method) return res.status(404).json({ message: "Payment method not found" })
        await method.destroy()

        res.json({ message: `Payment method '${method.name}' removed` })
    } catch (err) {
        console.error("Error removing payment method:", err)
        res.status(500).json({ message: "Failed to remove payment method", error: err.message })
    }
}

module.exports = { getAllMethods, addMethod, removeMethod }