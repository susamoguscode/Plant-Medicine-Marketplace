import { createContext, useContext, useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useRouter } from "next/router"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // fetch user saat load
    const fetchUser = async () => {
        try {
            const res = await axiosInstance.get("/auth/me")
            setUser(res.data.user)
        } catch (err) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const logout = async () => {
        await axiosInstance.post("/auth/logout")
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)