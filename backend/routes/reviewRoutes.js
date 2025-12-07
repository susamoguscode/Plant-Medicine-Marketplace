const express = require("express")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const router = express.Router()
const { getReviewsByProductId, createReview, updateReview, deleteReview, eligible } = require("../controllers/reviewController")

router.get("/:productId", getReviewsByProductId)
router.post("/:productId", verifyTokenFromCookie, createReview)
router.put("/:productId", verifyTokenFromCookie, updateReview)
router.delete("/:productId", verifyTokenFromCookie, deleteReview)
router.get("/eligible/:productId", verifyTokenFromCookie, eligible)

module.exports = router