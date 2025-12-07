const express = require("express")
const router = express.Router()
const { getAllProducts,
    getProductById,
    getProductsBySeller,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductAdmin } = require("../controllers/productController")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, "..", "uploads", "products")

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
const upload = multer({ storage })

// public routes
router.get("/", getAllProducts)
router.get("/allproducts", verifyTokenFromCookie, getAllProductAdmin)
router.get("/:id", getProductById)
router.get("/seller/:sellerId", getProductsBySeller)

// protected routes
router.post("/", verifyTokenFromCookie, upload.single("image"),createProduct)
router.put("/:id", verifyTokenFromCookie, upload.single("image"),updateProduct)
router.delete("/:id", verifyTokenFromCookie, deleteProduct)

module.exports = router