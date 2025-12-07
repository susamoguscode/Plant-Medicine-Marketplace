const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const PaymentMethod = require("../models/paymentMethodModel")

async function seeding() {
    const users = [
        {
            name: "Admin",
            email: "admin@example.com",
            password: "admin",
            role: "admin",
        },
        {
            name: "Seller 1",
            email: "seller1@example.com",
            password: "seller1",
            role: "seller",
        },
        {
            name: "Seller 2",
            email: "seller2@example.com",
            password: "seller2",
            role: "seller",
        },
    ]

    for (const user of users) {
        const exists = await User.findOne({ where: { email: user.email } })
        if (exists) {
            console.log(`${user.email} already exist`)
            continue
        }

        const hashedPassword = await bcrypt.hash(user.password, 10)

        await User.create({
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            money: 100000,
        })
    }

    const paymentMethods = ["E-wallet", "Cash on Delivery", "Bank Transfer", "Card", "QRIS"]

    for (const method of paymentMethods) {
        const exists = await PaymentMethod.findOne({ where: { name: method } })
        if (exists) {
            console.log(`${method} already exist`)
            continue
        }

        await PaymentMethod.create({ name: method })
    }
}

module.exports = seeding