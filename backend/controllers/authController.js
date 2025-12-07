const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const { OAuth2Client } = require("google-auth-library")
const CartItem = require("../models/cartItemModel")
const Order = require("../models/orderModel")
const OrderItem = require("../models/orderItemModel")
const Product = require("../models/productModel")
const Review = require("../models/reviewModel")
const fs = require("fs")
const path = require("path")

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {expiresIn: "3d",}) // 3 day aja kali ya
}

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body

    try {
        // check udh ada apa blm
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        })

        const token = generateToken(newUser)
        res.status(201).json({  message: "User registered successfully", user: newUser, token })
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        })
        res.status(200).json({ message: "Login successful", user, token })
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const googleFrontendLogin = async (req, res) => {
    const { credential } = req.body

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        const { email, name, sub: googleId, picture } = payload

        let user = await User.findOne({ where: { email } })

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                role: "user",
            })
        } else {
            if (!user.googleId) {
                user = await user.update({ googleId })
            }
        }

        const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        })
        res.status(200).json({ message: "Google login successful", user, token })
    } catch (error) {
        console.error("Google login error", error)
        res.status(401).json({ message: "Invalid Google token" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email", "role", "imageUrl", "money"]
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

const getAllUsers = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" })
        
    try {
        const users = await User.findAll({ attributes: { exclude: ["password"] } })
        res.json({ data: users })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users", error: err.message })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { name, role } = req.body

    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" })

    try {
        const user = await User.findByPk(id)
        if (!user) return res.status(404).json({ message: "User not found" })

        user.name = name || user.name
        user.role = role || user.role

        if (req.file) {
            if (user.imageUrl && user.imageUrl !== "/uploads/users/default.jpg" && !user.imageUrl.startsWith("http")) {
                const oldImagePath = path.join(__dirname, "../uploads/users", path.basename(user.imageUrl))
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old user image:", err.message)
                })
            }
            user.imageUrl = `/uploads/users/${req.file.filename}`
        }

        await user.save()
        res.json({ message: "User updated", user: { ...user.toJSON(), password: undefined } })
    } catch (err) {
        res.status(500).json({ message: "Failed to update user", error: err.message })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" })

    try {
        const user = await User.findByPk(id)
        if (!user) return res.status(404).json({ message: "User not found" })

        const userReviews = await Review.findAll({ where: { userId: id } })
        const affectedProductIds = [...new Set(userReviews.map(r => r.productId))]

        await Review.destroy({ where: { userId: id } })

        for (const productId of affectedProductIds) {
            const remainingReviews = await Review.findAll({ where: { productId } })

            const avgRating = remainingReviews.length > 0
                ? (remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length).toFixed(1)
                : 0

            await Product.update(
                {
                    rating: avgRating,
                    reviewCount: remainingReviews.length
                },
                { where: { id: productId } }
            )
        }

        await CartItem.destroy({ where: { userId: id } })

        const orders = await Order.findAll({ where: { userId: id } })
        for (const order of orders) {
            await OrderItem.destroy({ where: { orderId: order.id } })
        }
        await Order.destroy({ where: { userId: id } })

        if (user.role === "seller") {
            const products = await Product.findAll({ where: { sellerId: id } })
            for (const product of products) {
                await Review.destroy({ where: { productId: product.id } })
                await CartItem.destroy({ where: { productId: product.id } })
                await OrderItem.destroy({ where: { productId: product.id } })
            }
            await Product.destroy({ where: { sellerId: id } })
        }

        if (user.imageUrl && !user.imageUrl.includes("default.jpg")) {
            const imagePath = path.join(__dirname, "../uploads/users", path.basename(user.imageUrl))
            fs.unlink(imagePath, err => {
                if (err) console.error("Failed to delete user image:", err.message)
            })
        }

        await user.destroy()
        res.json({ message: "User deleted" })
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user", error: err.message })
    }
}

module.exports = { registerUser, loginUser, googleFrontendLogin, getMe, getAllUsers, updateUser, deleteUser }