require("dotenv").config()
const express = require("express")
const passport = require("passport")
const cors = require("cors")
const sequelize = require("./db")
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const cartItemRoutes = require("./routes/cartItemRoutes")
const orderRoutes = require("./routes/orderRoutes")
const topUpRoutes = require("./routes/topUpRequestRoutes")
const chatRoutes = require("./routes/chatRoutes")
const paymentRoutes = require("./routes/paymentMethodRoutes")
const seeding = require("./seed/seed")
const path = require("path")
const cookieParser = require("cookie-parser")
const http = require("http")
const { Server } = require("socket.io")

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
})
require("./socket/chatSocket")(io)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(express.json())
app.use(passport.initialize())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/cart", cartItemRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/topup", topUpRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/payment", paymentRoutes)

require("./models")

sequelize.authenticate()
    .then(async () => {
        console.log("Connection has been established successfully.")

        await sequelize.sync()

        await seeding()

        const PORT = process.env.PORT || 5000
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error)
    })