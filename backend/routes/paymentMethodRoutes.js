const express = require("express")
const router = express.Router()
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const { getAllMethods, addMethod, removeMethod } = require("../controllers/paymentMethodController")

router.post("/", verifyTokenFromCookie, addMethod)
router.get("/", getAllMethods)
router.delete("/:id", verifyTokenFromCookie, removeMethod)

module.exports = router