import React, { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import styles from "../styles/history.module.css"

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get("/order")
                setOrders(response.data.data)
            } catch (err) {
                console.error("Error fetching orders", err)
            }
        }
        fetchOrders()
    }, [])

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    if (loading || user?.role === "admin") return null

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Order History</h1>
            {orders.length === 0 ? (
                <p className={styles.noOrders}>No orders found</p>
            ) : (
                <ul className={styles.orderList}>
                    {orders.map(order => (
                        <li key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <h3 className={styles.orderId}>Order ID: {order.id}</h3>
                                <p className={styles.totalPrice}>Total Price: Rp {Number(order.totalPrice).toLocaleString("id-ID")}</p>
                                <p className={styles.totalPrice}>Payment Method : {order.paymentMethod}</p>
                            </div>
                            <ul className={styles.productList}>
                                {order.products.map(product => (
                                    <li key={product.id} className={styles.productItem}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <span className={styles.productQuantityPrice}>
                                            {product.OrderItem.quantity} x Rp{Number(product.OrderItem.priceAtPurchase).toLocaleString("id-ID")}
                                        </span>
                                        <span className={`${styles.itemStatus} ${
                                            product.OrderItem.status === 'pending' ? styles.statusPending :
                                            product.OrderItem.status === 'shipped' ? styles.statusShipped :
                                            product.OrderItem.status === 'delivered' ? styles.statusDelivered :
                                            styles.statusCanceled
                                        }`}>
                                            {product.OrderItem.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}