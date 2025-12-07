import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"

export default function AdminTopUpsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [topUps, setTopUps] = useState([])

    useEffect(() => {
        if (!loading) {
            if (user?.role === "admin") {
                fetchTopUps()
            } else {
                router.replace("/")
                return
            }
        }
    }, [loading, user])

    const fetchTopUps = async () => {
        try {
            const res = await axiosInstance.get("/topup/admin")
            setTopUps(res.data.data)
        } catch (err) {
            console.error("Failed to fetch top-ups", err)
        }
    }

    const handleAction = async (id, status) => {
        if (!confirm(`Are you sure you want to ${status} this top-up?`)) return
        try {
            await axiosInstance.patch(`/topup/${id}`, { action: status })
            await fetchTopUps()
        } catch (err) {
            console.error("Failed to update top-up", err)
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Admin - Incoming Top-Ups</h1>
            {topUps.length === 0 ? (
                <p>No pending top-up requests.</p>
            ) : (
                topUps.map((t) => (
                    <div key={t.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {t.user?.imageUrl && (
                                <img
                                    src={t.user.imageUrl.startsWith("http") ? t.user.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${t.user.imageUrl}`}
                                    alt="User avatar"
                                    style={{ width: 50, height: 50, borderRadius: "50%" }}
                                />
                            )}
                            <div style={{ flexGrow: 1 }}>
                                <p><strong>{t.user?.name}</strong></p>
                                <p>Amount: <strong>Rp {t.amount.toFixed(2)}</strong></p>
                                <p>Requested at: {new Date(t.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleAction(t.id, "accept")} style={{ backgroundColor: "green", color: "white", padding: "0.5rem" }}>
                                Accept
                            </button>
                            <button onClick={() => handleAction(t.id, "decline")} style={{ backgroundColor: "red", color: "white", padding: "0.5rem" }}>
                                Decline
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}