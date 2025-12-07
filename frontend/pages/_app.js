import { AuthProvider } from "../context/AuthContext"
import { GoogleOAuthProvider } from "@react-oauth/google"
import '../styles/global.css';
import Navbar from "@/components/Navbar"

const App = ({ Component, pageProps }) => {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Navbar />
        <Component {...pageProps} />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App