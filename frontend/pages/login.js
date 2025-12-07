import { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"
import styles from "../styles/login.module.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { user, setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post("/auth/login", { email, password }, {
        withCredentials: true,
      })
      setUser(res.data.user)
      console.log("Login response:", res.data)
    } catch (error) {
      alert(error.response?.data?.message || "Login failed")
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse
    try {
      const res = await axiosInstance.post("/auth/google/frontend", { credential })
      setUser(res.data.user)
      console.log("Login google:", res.data)
    } catch (error) {
      alert("Google login failed")
    }
  }

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login to Marketplace</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={styles.button} type="submit">Login</button>
        <div className={styles.divider}>or sign in with Google</div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google login failed")}
          clientId="147272879504-g4gjtddv5k69sp6f421s3540qcoiihad.apps.googleusercontent.com"
        />
      </form>
    </div>
  )
}
