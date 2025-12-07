import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import styles from "../../styles/seller/order.module.css"

export default function Orders() {
    const { user, loading } = useAuth()
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const router = useRouter()

    const fetchOrders = async () => {
        try {
            const res = await axiosInstance.get("/order/seller/getPendingOrders")
            setOrders(res.data.data)
        } catch (err) {
            console.error("Failed to fetch incoming orders", err)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleAccept = async (orderId, productId) => {
        try {
            await axiosInstance.patch(`/order/accept/${orderId}/${productId}`)
            fetchOrders()
        } catch (err) {
            console.error("Accept failed", err)
        }
    }

    const handleDecline = async (orderId, productId) => {
        try {
            await axiosInstance.patch(`/order/cancel/${orderId}/${productId}`)
            fetchOrders()
        } catch (err) {
            console.error("Decline failed", err)
        }
    }

    useEffect(() => {
        if (!loading) {
            if (user?.role !== "seller") {
                router.push("/")
            } else {
                fetchOrders()
            }
        }
    }, [user, loading])

    if (loading || loadingOrders) return <p className={styles.emptyStateMessage}>Loading orders...</p>
    if (orders.length === 0) return <p className={styles.emptyStateMessage}>No incoming orders.</p>

    return (
        <div className={styles.page}>
            <h1 className={styles.heading}>Incoming Orders</h1>
            {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                    <p className={styles.customer}>Customer: {order.user.name}</p>
                    {order.orderItems.map(item => (
                        <div key={item.id} className={styles.orderItem}>
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.product.imageUrl}`}
                                alt={item.product.name}
                                className={styles.productImage}
                            />
                            <div className={styles.productDetails}>
                                <p className={styles.productName}>{item.product.name}</p>
                                <p>Qty: {item.quantity}</p>
                                <p>Price: Rp {item.priceAtPurchase}</p>
                                <div className={styles.buttons}>
                                    <button
                                        className={styles.acceptButton}
                                        onClick={() => handleAccept(order.id, item.product.id)}
                                        disabled={item.status !== "pending"}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className={styles.declineButton}
                                        onClick={() => handleDecline(order.id, item.product.id)}
                                        disabled={item.status !== "pending"}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}