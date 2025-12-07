"use client"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import styles from "../styles/navbar.module.css"

export default function Navbar() {
    const { user, logout, loading } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                <Link href="/" className={styles.logo}>Marketplace</Link>
                {!loading && user?.imageUrl && (
                    <img
                        src={user.imageUrl.startsWith("http") ? user.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${user.imageUrl}`}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                )}
                {!loading && (
                    <h1 className={styles.title}>
                        Welcome {user?.name || user?.email || "Guest"}
                    </h1>
                )}
            </div>

            <ul className={styles.navList}>
                {(!user || user.role !== "admin") && (
                    <Link href="/diseasepredict" className={styles.link}>Predict Disease</Link>
                )}
                {!user ? (
                    <div className={styles.linkGroup}>
                        <Link href="/login" className={styles.link}>Login</Link>
                        <Link href="/register" className={styles.link}>Register</Link>
                    </div>
                ) : user.role === "admin" ? (
                    <div className={styles.linkGroup}>
                        <Link href="/admin/products" className={styles.link}>Products</Link>
                        <Link href="/admin/users" className={styles.link}>Users</Link>
                        <Link href="/admin/topups" className={styles.link}>Top-Ups</Link>
                        <Link href="/admin/payments" className={styles.link}>Payment Methods</Link>
                        <button onClick={handleLogout} className={styles.button} >Logout</button>
                    </div>
                ) : (
                    <div className={styles.linkGroup}>
                        {user.role === "seller" && (
                            <>
                                <Link href="/seller/products" className={styles.link}>Your Products</Link>
                                <Link href="/seller/orders" className={styles.link}>Orders</Link>
                            </>
                        )}
                        <Link href="/topup" className={styles.link}>Top-Up History</Link>
                        <Link href="/cart" className={styles.link}>Cart</Link>
                        <Link href="/history" className={styles.link}>Purchase History</Link>
                        <Link href="/chat/chat-list" className={styles.link}>Chats</Link>
                        <span className={styles.money}>Money: {user.money}</span>
                        <button onClick={handleLogout} className={styles.button}>Logout</button>
                    </div>
                )}
            </ul>
        </nav>
    )
}
