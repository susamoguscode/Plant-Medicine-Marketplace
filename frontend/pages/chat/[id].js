import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import styles from "../../styles/chat/chatPage.module.css";

export default function ChatPage() {
    const socket = useSocket();
    const router = useRouter();
    const { id } = router.query;
    const { user, loading } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/")
                return
            }

            if (user?.role === "admin") {
                router.replace("/admin/users")
                return
            }
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user || !id || !socket) return;

        socket.emit("joinRoom", { chatRoomId: id, userId: user.id, role: user.role });

        const handleChatHistory = (msgs) => setMessages(msgs);
        const handleNewMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
            socket.emit("markAsRead", { chatRoomId: id, userId: user.id });
        };

        socket.on("chatHistory", handleChatHistory);
        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("chatHistory", handleChatHistory);
            socket.off("newMessage", handleNewMessage);
        };
    }, [id, user, socket]);

    const send = () => {
        if (newMsg.trim()) {
            socket.emit("sendMessage", {
                chatRoomId: id,
                senderId: user.id,
                content: newMsg,
            });
            setNewMsg("");
        }
    };

    if (loading || user?.role === "admin") return <p className={styles.loadingOrUnauthorized}>Loading or Unauthorized</p>;
    if (!user) return null

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesBox}>
                {messages.length === 0 ? (
                    <p className={styles.noMessages}>No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`${styles.message} ${msg.senderId === user.id ? styles.senderMessage : styles.receiverMessage}`}>
                            <div className={styles.messageContent}>
                                <div className={styles.messageUsername}>{msg.username || msg.User?.name}</div>
                                <div className={styles.messageText}>{msg.content}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className={styles.inputArea}>
                <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    className={styles.messageInput}
                    placeholder="Type a message..."
                />
                <button onClick={send} className={styles.sendButton}>Send</button>
            </div>
        </div>
    );
}