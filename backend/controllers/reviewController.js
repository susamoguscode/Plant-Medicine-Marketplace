const Review = require("../models/reviewModel")
const Product = require("../models/productModel")
const User = require("../models/userModel")
const OrderItem = require("../models/orderItemModel")
const Order = require("../models/orderModel")

const getReviewsByProductId = async (req, res) => {
    try {
        const productId = req.params.productId
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = 10
        const offset = (page - 1) * limit

        const { count, rows } = await Review.findAndCountAll({
            where: { productId },
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: {
                model: User,
                as: "user",
                attributes: ["id", "name", "imageUrl"], // ambil nama buat display
            }
        })

        res.json({
            meta: {
                total: count,
                page,
                lastPage: Math.ceil(count / limit)
            },
            data: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch reviews", error: err.message })
    }
}

const createReview = async (req, res) => {
    try {
        const productId = req.params.productId
        const { rating, comment = "" } = req.body
        const userId = req.user.id

        if (!rating) return res.status(400).json({ message: "Rating is required" })

        const product = await Product.findByPk(productId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        const hasPurchased = await OrderItem.findOne({
            where: {
                productId: productId,
                status: "completed",
            },
            include: {
                model: Order,
                where: { userId },
                as: "order"
            }
        })

        if (!hasPurchased) return res.status(400).json({ message: "You have never purchased this product" })

        const existingReview = await Review.findOne({ where: { userId, productId } })
        if (existingReview) return res.status(400).json({ message: "You have already reviewed this product" })

        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        })

        const allReviews = await Review.findAll({ where: { productId } })
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        product.rating = avgRating.toFixed(1)
        product.reviewCount = allReviews.length
        await product.save()

        res.status(201).json(review)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to create review", error: err.message })
    }
}

const updateReview = async (req, res) => {
    try {
        const productId = req.params.productId
        const { rating, comment = "" } = req.body
        const userId = req.user.id

        if (!rating) return res.status(400).json({ message: "Rating is required" })

        const product = await Product.findByPk(productId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        const hasPurchased = await OrderItem.findOne({
            where: {
                productId: productId,
                status: "completed",
            },
            include: {
                model: Order,
                where: { userId },
                as: "order"
            }
        })

        if (!hasPurchased) return res.status(400).json({ message: "You have never purchased this product" })

        const existingReview = await Review.findOne({ where: { userId, productId } })
        if (!existingReview) return res.status(404).json({ message: "Review not found" })
        if (existingReview.userId !== userId) return res.status(403).json({ message: "You can only update your own review" })

        existingReview.rating = rating
        existingReview.comment = comment
        await existingReview.save()

        const allReviews = await Review.findAll({ where: { productId } })
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        product.rating = avgRating.toFixed(1)
        product.reviewCount = allReviews.length
        await product.save()

        res.status(200).json(existingReview)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to update review", error: err.message })
    }
}

const deleteReview = async (req, res) => {
    try {
        const productId = req.params.productId
        const userId = req.user.id

        const product = await Product.findByPk(productId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        const hasPurchased = await OrderItem.findOne({
            where: {
                productId: productId,
                status: "completed",
            },
            include: {
                model: Order,
                where: { userId },
                as: "order"
            }
        })

        if (!hasPurchased) return res.status(400).json({ message: "You have never purchased this product" })

        const existingReview = await Review.findOne({ where: { userId, productId } })
        if (!existingReview) return res.status(404).json({ message: "Review not found" })
        if (existingReview.userId !== userId) return res.status(403).json({ message: "You can only update your own review" })

        await existingReview.destroy()

        const allReviews = await Review.findAll({ where: { productId } })
        const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0
        product.rating = avgRating.toFixed(1)
        product.reviewCount = allReviews.length
        await product.save()

        res.status(200).json({ message: "Review deleted successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to delete review", error: err.message })
    }
}

const eligible = async (req, res) => {
    const userId = req.user.id
    const productId = req.params.productId

    try {
        const hasPurchased = await OrderItem.findOne({
            where: {
                productId: productId,
                status: "completed",
            },
            include: {
                model: Order,
                where: { userId },
                as: "order"
            }
        })

        res.json({ eligible: !!hasPurchased })
    } catch (err) {
        console.error('Eligibility check failed:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = {
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview,
    eligible
}