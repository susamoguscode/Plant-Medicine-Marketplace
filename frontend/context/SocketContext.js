import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"
import { useEffect, useState } from "react"

let socketInstance = null

export function useSocket() {
    const { user, loading } = useAuth()
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (!loading && user?.id) {
            if (!socketInstance) {
                socketInstance = io("http://localhost:5000", {
                    withCredentials: true,
                    auth: { userId: user.id },
                })
            }
            setSocket(socketInstance)

            const handleRoomJoined = (chatRoomId) => {
                socketInstance.emit("markAsRead", {
                    chatRoomId,
                    userId: user.id,
                })
            }
            socketInstance.on("roomJoined", handleRoomJoined)

            return () => {
                socketInstance.off("roomJoined", handleRoomJoined)
            }
        }
    }, [loading, user])

    return socket
}

export default socketInstance