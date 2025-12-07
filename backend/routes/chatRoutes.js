const express = require("express")
const router = express.Router()
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const { getChatUser, getChatSeller } = require("../controllers/chatController")

router.get("/user", verifyTokenFromCookie, getChatUser)
router.get("/seller", verifyTokenFromCookie, getChatSeller)

module.exports = router