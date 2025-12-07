const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const verifyTokenFromCookie = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Not authenticated" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "name", "email", "role", "googleId"]
        })
        if (!user) return res.status(401).json({ message: "Invalid token" })
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

module.exports = {
    verifyTokenFromCookie,
}