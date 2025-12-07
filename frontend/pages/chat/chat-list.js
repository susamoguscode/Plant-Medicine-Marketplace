import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/axiosInstance";
import styles from "../../styles/chat/chatList.module.css";

export default function ChatList() {
    const socket = useSocket();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (!user) {
            router.replace("/")
            return
        }

        if (!loading && user?.role === "admin") {
            router.replace("/admin/users");
        }

        const fetchChats = async () => {
            try {
                const endpoint = user?.role === "user" ? "/chat/user" : "/chat/seller";
                const res = await axiosInstance.get(endpoint);
                setChats(res.data);
            } catch (err) {
                console.error("Failed to fetch chats:", err);
            }
        };

        if (!loading) {
            fetchChats();
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!socket || !user) return;

        socket.on("chatUpdated", (chatUpdate) => {
            setChats((prevChats) => {
                const existingChat = prevChats.find(chat => chat.id === chatUpdate.id)
                if (existingChat) {
                    return prevChats.map(chat =>
                        chat.id === chatUpdate.id
                            ? { ...chat, ...chatUpdate }
                            : chat
                    )
                } else {
                    return [{ ...chatUpdate }, ...prevChats]
                }
            })
        })

        return () => {
            socket.off("chatUpdated")
        }
    }, [socket, user])

    if (loading || user?.role === "admin") return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Your Chats</h2>
            {chats.length === 0 ? (
                <p className={styles.noChats}>No chats yet. Start a conversation with a seller or customer!</p>
            ) : (
                <ul className={styles.chatList}>
                    {chats.map((chat) => (
                        <li key={chat.id} className={styles.chatItem}>
                            <a href={`/chat/${chat.id}`} className={styles.chatLink}>
                                <p className={styles.chatInfo}>
                                    Chat with {chat.otherParty.name}
                                    {chat.unread > 0 && (
                                        <strong className={styles.unreadCount}>
                                            {chat.unread === "10+" ? "10+" : chat.unread}
                                        </strong>
                                    )}
                                </p>
                                <p className={styles.latestMessage}>
                                    {chat.latestMessage}
                                </p>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}