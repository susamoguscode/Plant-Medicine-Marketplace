const express = require("express")
const router = express.Router()
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const { createOrder, getOrderHistory, getSellerPendingOrders, acceptOrderItem, cancelOrderItem } = require("../controllers/orderController")

router.get("/", verifyTokenFromCookie, getOrderHistory)
router.post("/", verifyTokenFromCookie, createOrder)
router.get("/seller/getPendingOrders", verifyTokenFromCookie, getSellerPendingOrders)
router.patch("/accept/:orderId/:productId", verifyTokenFromCookie, acceptOrderItem)
router.patch("/cancel/:orderId/:productId", verifyTokenFromCookie, cancelOrderItem)

module.exports = router