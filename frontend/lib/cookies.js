import Cookies from "js-cookie"

export const deleteToken = () => {
    Cookies.remove("token")
}