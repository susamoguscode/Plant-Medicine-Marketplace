const Message = require("../models/messageModel")
const ChatRoom = require("../models/chatRoomModel")
const User = require("../models/userModel")
const { Op } = require("sequelize")

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id)

        const userId = socket.handshake.auth?.userId || null
        if (userId) {
            socket.join(`user_${userId}`)
        }

        socket.on("joinRoom", async (data) => {
            try {
                let room

                if (data.chatRoomId) {
                    room = await ChatRoom.findByPk(data.chatRoomId)
                    if (!room) {
                        socket.emit("error", "Chat room does not exist")
                        return
                    }
                } else if (data.userId && data.sellerId) {
                    room = await ChatRoom.findOne({ where: { userId: data.userId, sellerId: data.sellerId } })
                    if (!room && data.role === "user") {
                        room = await ChatRoom.create({ userId: data.userId, sellerId: data.sellerId })
                    }
                    if (!room) {
                        socket.emit("error", "Chat room does not exist. Only users can initiate chat.")
                        return
                    }
                } else {
                    socket.emit("error", "Invalid room join parameters")
                    return
                }

                const roomName = `room_${room.id}`
                socket.join(roomName)

                const messages = await Message.findAll({
                    where: { chatRoomId: room.id },
                    include: [{ model: User, attributes: ["id", "name"] }],
                    order: [["timestamp", "ASC"]],
                })

                socket.emit("chatHistory", messages)
                socket.emit("roomJoined", room.id)
            } catch (err) {
                console.error("joinRoom error:", err)
                socket.emit("error", "Failed to join room")
            }
        })

        socket.on("sendMessage", async ({ chatRoomId, senderId, content }) => {
            try {
                const message = await Message.create({ chatRoomId, senderId, content })
                const sender = await User.findByPk(senderId)

                io.to(`room_${chatRoomId}`).emit("newMessage", {
                    id: message.id,
                    content,
                    senderId,
                    username: sender.name,
                    timestamp: message.timestamp,
                })

                const chatRoom = await ChatRoom.findByPk(chatRoomId)
                if (!chatRoom) return

                const usersToNotify = [chatRoom.userId, chatRoom.sellerId]
                for (const userId of usersToNotify) {
                    const unreadCount = await Message.count({
                        where: {
                            chatRoomId,
                            read: false,
                            senderId: { [Op.ne]: userId }
                        }
                    })

                    const otherUserId = usersToNotify.find((id) => id !== userId)
                    const otherUser = await User.findByPk(otherUserId, { attributes: ["id", "name"] })

                    io.to(`user_${userId}`).emit("chatUpdated", {
                        id: chatRoom.id,
                        latestMessage: content,
                        unread: unreadCount > 10 ? "10+" : unreadCount,
                        otherParty: otherUser,
                    })
                }
            } catch (err) {
                console.error("joinRoom error:", err)
                socket.emit("error", "Failed to join room")
            }
        })

        socket.on("markAsRead", async ({ chatRoomId, userId }) => {
            try {
                await Message.update(
                    { read: true },
                    {
                        where: {
                            chatRoomId,
                            read: false,
                            senderId: { [Op.ne]: userId },
                        },
                    }
                )

                io.to(`room_${chatRoomId}`).emit("messagesRead", {
                    chatRoomId,
                    readerId: userId,
                })
            } catch (err) {
                console.error("joinRoom error:", err)
                socket.emit("error", "Failed to join room")
            }
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)
        })
    })
}