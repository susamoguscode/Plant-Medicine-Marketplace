const express = require("express")
const passport = require("passport")
const { registerUser, loginUser, googleFrontendLogin, getMe, getAllUsers, updateUser, deleteUser } = require("../controllers/authController.js")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, "..", "uploads", "users")
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
        }
        cb(null, folderPath)
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})
const uploadUserImage = multer({ storage })

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/google/frontend", googleFrontendLogin)
router.get("/me", verifyTokenFromCookie, getMe)
router.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.json({ message: "Logged out successfully" })
})
router.get("/", verifyTokenFromCookie, getAllUsers)
router.put("/:id", verifyTokenFromCookie, uploadUserImage.single("image"), updateUser)
router.delete("/:id", verifyTokenFromCookie, deleteUser)

module.exports = router