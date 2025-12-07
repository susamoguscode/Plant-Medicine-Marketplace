import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import styles from "../styles/topup.module.css"

export default function TopUpPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [history, setHistory] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState(null)
    const [manualAmount, setManualAmount] = useState("")

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get("/topup/history")
            setHistory(res.data.data)
        } catch (err) {
            console.error("Failed to fetch history", err)
        }
    }

    const presetAmounts = [10000, 20000, 50000, 100000, 200000]

    const handlePresetClick = (amount) => {
        setSelectedAmount(amount)
        setManualAmount("")
    }

    const handleManualChange = (e) => {
        setManualAmount(e.target.value)
        setSelectedAmount(null)
    }

    const handleSubmit = async () => {
        const amount = selectedAmount || parseFloat(manualAmount)
        if (!amount || amount <= 0) return alert("Enter a valid amount")

        try {
            await axiosInstance.post("/topup", { amount })
            setIsModalOpen(false)
            setSelectedAmount(null)
            setManualAmount("")
            fetchHistory()
        } catch (err) {
            console.error("Failed to submit top-up", err)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Top-Up Balance</h1>
            <button className={styles.topUpButton} onClick={() => setIsModalOpen(true)}>
                Request Top-Up
            </button>

            <h2 className={styles.historyTitle}>Top-Up History</h2>

            {history.length === 0 ? (
                <p>No top-up history yet.</p>
            ) : (
                history.map((t) => (
                    <div key={t.id} className={styles.historyCard}>
                        <p>Amount: <strong>Rp {t.amount.toLocaleString()}</strong></p>
                        <p>Status: <strong>{t.status}</strong></p>
                        <p>Date: {new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                ))
            )}

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Top-Up Amount</h2>
                        <div className={styles.amounts}>
                            {presetAmounts.map((amt) => (
                                <div
                                    key={amt}
                                    onClick={() => handlePresetClick(amt)}
                                    className={`${styles.amountOption} ${selectedAmount === amt ? styles.selected : ""}`}
                                >
                                    Rp {amt.toLocaleString()}
                                </div>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Or enter manually"
                            value={manualAmount}
                            onChange={handleManualChange}
                            className={styles.manualInput}
                        />
                        <div className={styles.modalButtons}>
                            <button className={styles.submitButton} onClick={handleSubmit}>Top Up</button>
                            <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
