const Message = require("../models/messageModel")
const ChatRoom = require("../models/chatRoomModel")
const User = require("../models/userModel")
const { Op } = require("sequelize")

const getChatUser = async (req, res) => {
    try {
        const userId = req.user.id

        const chatRooms = await ChatRoom.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    as: "Seller",
                    attributes: ["id", "name", "imageUrl"]
                },
                {
                    model: Message,
                    limit: 1,
                    order: [["timestamp", "DESC"]],
                    separate: true
                }
            ]
        })

        const chatlist = await Promise.all(
            chatRooms.map(async (room) => {
                const latestMessage = room.Messages[0]

                const unreadCount = await Message.count({
                    where: {
                        chatRoomId: room.id,
                        senderId: { [Op.ne]: userId },
                        read: false
                    }
                })

                return latestMessage
                    ? {
                        id: room.id,
                        otherParty: room.Seller,
                        latestMessage: latestMessage.content,
                        unread: unreadCount > 0 ? (unreadCount > 10 ? "10+" : unreadCount) : 0,
                        timestamp: latestMessage?.timestamp || null
                    }
                    : null
            })
        )

        res.json(chatlist.filter(Boolean))
    } catch (err) {
        res.status(500).json({ message: "Failed to get chat", error: err.message })
    }
}

const getChatSeller = async (req, res) => {
    try {
        const sellerId = req.user.id

        const chatRooms = await ChatRoom.findAll({
            where: { sellerId },
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "name", "imageUrl"]
                },
                {
                    model: Message,
                    limit: 1,
                    order: [["timestamp", "DESC"]],
                    separate: true
                }
            ]
        })

        const chatlist = await Promise.all(
            chatRooms.map(async (room) => {
                const latestMessage = room.Messages[0]

                const unreadCount = await Message.count({
                    where: {
                        chatRoomId: room.id,
                        senderId: { [Op.ne]: sellerId },
                        read: false
                    }
                })

                return latestMessage
                    ? {
                        id: room.id,
                        otherParty: room.User,
                        latestMessage: latestMessage.content,
                        unread: unreadCount > 0 ? (unreadCount > 10 ? "10+" : unreadCount) : 0,
                        timestamp: latestMessage?.timestamp || null
                    }
                    : null
            })
        )

        res.json(chatlist.filter(Boolean))
    } catch (err) {
        res.status(500).json({ message: "Failed to get chat", error: err.message })
    }
}

module.exports = {
    getChatUser,
    getChatSeller
}