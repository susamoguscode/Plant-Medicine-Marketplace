import React, { useEffect, useRef, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import styles from '../styles/cart.module.css';

export default function CartPage() {
    const { user, loading } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [checkedItems, setCheckedItems] = useState([])
    const [isCalculatingTotal, setIsCalculatingTotal] = useState(false)
    const [total, setTotal] = useState(0)
    const [isDebouncing, setIsDebouncing] = useState(false)
    const router = useRouter()
    const [paymentMethods, setPaymentMethods] = useState([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

    const debounceTimeout = useRef({})
    const calcTimeout = useRef(null)

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosInstance.get("/cart")
                setCartItems(res.data.data)

                const res2 = await axiosInstance.get("/payment")
                setPaymentMethods(res2.data.data)
            } catch (err) {
                console.error("Failed to fetch cart items", err)
            }
        }

        fetchCart()
    }, [])

    const handleQuantityChange = (id, quantity) => {
        if (!id) return
        
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: quantity } : item
            )
        )
        setIsDebouncing(true)

        if (debounceTimeout.current[id]) clearTimeout(debounceTimeout.current[id])

        debounceTimeout.current[id] = setTimeout(async () => {
            try {
                await axiosInstance.put(`/cart/${id}`, { quantity })
            } catch (err) {
                console.error("Update failed", err)
            } finally {
                delete debounceTimeout.current[id]
                if (Object.keys(debounceTimeout.current).length === 0) {
                    setIsDebouncing(false)
                }
            }
        }, 800)
    }

    const handleRemoveItem = async id => {
        try {
            await axiosInstance.delete(`/cart/${id}`)
            setCartItems(cartItems.filter(item => item.id !== id))
        } catch (err) {
            console.error("Failed to delete cart item", err)
        }
    }

    const handleCheckout = async () => {
        if (user.money < total) {
            alert("Insufficient balance")
            return
        }
        try {
            const itemsToBuy = cartItems
            .filter(i => checkedItems.includes(i.productId))
            .map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.product.price,
            }))

            await axiosInstance.post("/order", {
                items: itemsToBuy,
                totalPrice: total,
                paymentMethod: selectedPaymentMethod
            })

            await axiosInstance.delete("/cart", {
                data: { productIds: checkedItems }
            })
            setCartItems(items => items.filter(i => !checkedItems.includes(i.productId)))
            setCheckedItems([]) 
            setSelectedPaymentMethod("")
        } catch (err) {
            console.error("Checkout failed", err)
        }
    }

    useEffect(() => {
        if (isDebouncing) return

        setIsCalculatingTotal(true)

        if (calcTimeout.current) clearTimeout(calcTimeout.current)

        calcTimeout.current = setTimeout(() => {
            const totalAmount = cartItems
                .filter(item => checkedItems.includes(item.productId))
                .reduce((acc, item) => acc + item.quantity * item.product.price, 0)
            setTotal(totalAmount)
            setIsCalculatingTotal(false)
        }, 300)
    }, [cartItems, checkedItems, isDebouncing])

    const isCheckoutDisabled = checkedItems.length === 0 || isDebouncing || isCalculatingTotal || !selectedPaymentMethod

    const handleCheckboxChange = (productId, checked) => {
        if (checked) {
            setCheckedItems([...checkedItems, productId])
        } else {
            setCheckedItems(checkedItems.filter(id => id !== productId))
        }
    }

    if (loading || user?.role === "admin") return null

    return (
        <div className={styles.cartContainer}>
            <h1 className={styles.cartHeader}>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <div className={styles.cartItemContainer}>
                    {cartItems.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <div className={styles.cartItemDetails}>
                                <input
                                    type="checkbox"
                                    checked={checkedItems.includes(item.productId)}
                                    onChange={e =>
                                        handleCheckboxChange(item.productId, e.target.checked)
                                    }
                                    className={styles.checkbox}
                                />
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${item.product.imageUrl}`} 
                                    alt={item.product.name} 
                                    className={styles.cartItemImage}
                                />
                                <div className={styles.cartItemInfo}>
                                    <h3>{item.product.name}</h3>
                                    <p>Rp {Number(item.product.price).toLocaleString("id-ID")}</p>
                                </div>
                            </div>
                            <div className={styles.cartItemActions}>
                                <div className={styles.quantityButtons}>
                                    <button 
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        min="1"
                                        max={item.product.stock}
                                        onChange={e => {
                                            let value = parseInt(e.target.value)
                                            if (isNaN(value) || value < 1) value = 1
                                            if (value > item.product.stock) value = item.product.stock
                                            handleQuantityChange(item.id, value)
                                        }}
                                        className={styles.quantityInput}
                                    />
                                    <button 
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                                        disabled={item.quantity >= item.product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <button onClick={() => handleRemoveItem(item.id)} className={styles.removeButton}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className={styles.cartFooter}>
                {(isCalculatingTotal || isDebouncing) ? (
                    <span className={styles.calculatingTotal}>Calculating total...</span>
                ) : (
                    <div>
                        Total: Rp {Number(total).toLocaleString("id-ID")}
                    </div>
                )}
            </div>

            <div style={{ margin: "10px 0" }}>
                <label htmlFor="payment-method" style={{ marginRight: 8, fontWeight: 500 }}>
                    Payment Method:
                </label>
                <select
                    id="payment-method"
                    value={selectedPaymentMethod}
                    onChange={e => setSelectedPaymentMethod(e.target.value)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 14,
                        backgroundColor: "#fff",
                        cursor: "pointer"
                    }}
                >
                    <option value="">-- Select Payment --</option>
                    {paymentMethods.map(method => (
                        <option key={method.id} value={method.name}>
                            {method.name}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                onClick={handleCheckout} 
                disabled={isCheckoutDisabled}
                className={styles.checkoutButton}
            >
                {isCalculatingTotal ? "Processing..." : "Checkout"}
            </button>
        </div>
    )
}
