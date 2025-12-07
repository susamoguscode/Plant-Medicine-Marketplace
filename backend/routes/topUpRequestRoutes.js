const express = require("express")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const router = express.Router()
const { createTopUp, getIncomingTopUps, getTopUpHistory, handleTopUp } = require("../controllers/topUpRequestController")

router.get("/admin", verifyTokenFromCookie, getIncomingTopUps)
router.get("/history", verifyTokenFromCookie, getTopUpHistory)
router.post("/", verifyTokenFromCookie, createTopUp)
router.patch("/:id", verifyTokenFromCookie, handleTopUp)

module.exports = router