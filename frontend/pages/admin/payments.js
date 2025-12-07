import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import styles from '../../styles/admin/userManager.module.css'

export default function AdminPaymentPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [methods, setMethods] = useState([])
    const [newMethod, setNewMethod] = useState("")

    const fetchMethods = async () => {
        try {
            const res = await axiosInstance.get("/payment")
            setMethods(res.data.data)
        } catch (err) {
            console.error("Failed to fetch methods", err)
        }
    }

    useEffect(() => {
        if (!loading) {
            if (user?.role === "admin") {
                fetchMethods()
            } else {
                router.replace("/")
                return
            }
        }
    }, [loading, user])

    const handleAdd = async () => {
        if (!newMethod.trim()) {
            alert("Method name cannot be empty")
            return
        }
        try {
            await axiosInstance.post("/payment", { name: newMethod })
            setNewMethod("")
            fetchMethods()
            alert("Payment method added")
        } catch (err) {
            alert("Failed to add method")
        }
    }

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/payment/${id}`)
            fetchMethods()
            alert("Payment method removed")
        } catch (err) {
            alert("Failed to delete method")
        }
    }

    if (loading || user?.role !== "admin") return <p className={styles.loadingOrUnauthorized}>Loading or Unauthorized</p>

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Admin - Payment Methods</h1>

            <div className={styles.searchBarContainer}>
                <input
                    type="text"
                    placeholder="New payment method name..."
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className={styles.searchInput}
                />
                <button
                    className={`${styles.button} ${styles.editButton}`}
                    style={{ marginLeft: "1rem" }}
                    onClick={handleAdd}
                >
                    Add
                </button>
            </div>

            {methods.length === 0 ? (
                <p className={styles.noUsers}>No payment methods added yet.</p>
            ) : (
                methods.map((method) => (
                    <div key={method.id} className={styles.userCard}>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{method.name}</p>
                        </div>
                        <div className={styles.actions}>
                            <button
                                className={`${styles.button} ${styles.deleteButton}`}
                                onClick={() => handleDelete(method.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}