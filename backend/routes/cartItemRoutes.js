const express = require("express")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const router = express.Router()
const { getCart, addToCart, clearCheckedItems, updateItem, clearSingleItem } = require("../controllers/cartItemController")

router.get("/", verifyTokenFromCookie, getCart)
router.post("/", verifyTokenFromCookie, addToCart)
router.delete("/", verifyTokenFromCookie, clearCheckedItems)
router.put("/:id", verifyTokenFromCookie, updateItem)
router.delete("/:id", verifyTokenFromCookie, clearSingleItem)

module.exports = router