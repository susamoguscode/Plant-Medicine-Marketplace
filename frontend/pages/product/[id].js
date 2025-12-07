import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axiosInstance from "../../axiosInstance"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import styles from '../../styles/product.module.css'
import { useSocket } from "@/context/SocketContext"

export default function ProductDetail() {
    const socket = useSocket()
    const router = useRouter()
    const { id } = router.query
    const { user, loading } = useAuth()

    const [product, setProduct] = useState(null)

    const [quantity, setQuantity] = useState(1)

    const [reviews, setReviews] = useState([])
    const [reviewPage, setReviewPage] = useState(1)
    const [reviewLastPage, setReviewLastPage] = useState(1)

    const [myReview, setMyReview] = useState(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })

    useEffect(() => {
        if (!socket) return
        return () => {
            socket.off("roomJoined")
            socket.off("error")
        }
    }, [socket])

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        if (!id) return
        axiosInstance
            .get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(console.error)
    }, [id])

    useEffect(() => {
        if (!id) return
        axiosInstance
            .get(`/reviews/${id}`, { params: { page: reviewPage } })
            .then(res => {
                setReviews(res.data.data)
                setReviewLastPage(res.data.meta.lastPage)
                if (user) {
                    const mine = res.data.data.find(r => r.user?.id === user.id)
                    if (mine) setMyReview(mine)
                }
            })
            .catch(console.error)
    }, [id, reviewPage])

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please login first")
            router.push("/login")
            return
        }

        if (user?.role === "seller" && user.id === product.sellerId) {
            alert("You cannot add your own product to the cart.")
            return
        }

        try {
            await axiosInstance.post("/cart", {
                productId: product.id,
                quantity: quantity,
            })
            alert("Added to cart")
        } catch (err) {
            console.error("Add to cart failed", err)
            alert("Failed to add to cart")
        }
    }

    const handleContact = (sellerId) => {
        if(!user) {
            alert("Please login first")
            router.push("/login")
            return
        }

        if (user.role !== "user") {
            alert("Only buyers can initiate chat")
            return
        }

        if (user.id === sellerId) {
            alert("Cannot contact yourself")
            return
        }

        socket.emit("joinRoom", {
            userId: user.id,
            sellerId,
            role: "user",
        })

        socket.once("roomJoined", (roomId) => {
            router.push(`/chat/${roomId}`)
        })

        socket.once("error", (err) => {
            alert(err)
        })
    }

    if (loading || user?.role === "admin") return null
    if (!product) return <p className={styles.loading}>Loading...</p>

    return (
        <>
            <main className={styles.productContainer}>
                <h1 className={styles.productTitle}>{product.name}</h1>
                
                <div className={styles.productHeader}>
                    {product.imageUrl && (
                        <div className={styles.productImage}>
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                                alt={product.name}
                            />
                        </div>
                    )}

                    <div className={styles.productInfo}>    
                        <div className={styles.productDetails}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Price:</span>
                                <span className={styles.detailValue}>{Number(product.price).toLocaleString("id-ID")}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Stock:</span>
                                <span className={styles.detailValue}>{product.stock}</span>
                            </div>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Description:</span>
                                <span className={styles.detailValue}>{product.description}</span>
                            </div>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Usage Instructions:</span>
                                <span className={styles.detailValue}>{product.usageInstructions || "-"}</span>
                            </div>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Ingredients:</span>
                                <span className={styles.detailValue}>{product.ingredients || "-"}</span>
                            </div>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Disease Targets:</span>
                                <span className={styles.detailValue}>
                                    {product.diseaseTargets?.length
                                        ? product.diseaseTargets.join(", ")
                                        : "-"}
                                </span>
                            </div>
                        </div>
                        
                        <div className={styles.sellerInfo}>
                            <Link href={`/seller/${product.sellerId}`} className={styles.sellerLink}>
                                <img 
                                    className={styles.sellerImage}
                                    src={product.seller.imageUrl.startsWith("http") ? product.seller.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                                    alt={product.seller.name}
                                />
                                <span className={styles.sellerName}>{product.seller.name}</span>
                            </Link>
                        </div>

                        {user && user.id !== product.sellerId && user.role !== "seller" && (
                            <button
                                className={styles.contactSellerBtn}
                                onClick={() => handleContact(product.sellerId)}
                            >
                                Contact Seller
                            </button>
                        )}
                        <br></br>

                        {/* quantity selector */}
                        <div className={styles.quantitySelector}>
                            <label className={styles.quantityLabel}>Quantity:</label>
                            <div className={styles.quantityControls}>
                                <button 
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                    disabled={quantity <= 1}
                                >
                                    –
                                </button>

                                <input
                                    className={styles.quantityInput}
                                    type="number"
                                    value={quantity}
                                    min="1"
                                    max={product.stock}
                                    onChange={e => {
                                        let value = parseInt(e.target.value)
                                        if (isNaN(value) || value < 1) value = 1
                                        if (value > product.stock) value = product.stock
                                        setQuantity(value)
                                    }}
                                />

                                <button 
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart} 
                            disabled={product.stock <= 0}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>

                <hr className={styles.divider} />

                {/* User's review section */}
                <section className={styles.reviewsSection}>
                    <h2 className={styles.reviewsHeading}>Your Review</h2>
                    {myReview ? (
                        <div className={styles.reviewCard}>
                            <p><span className={styles.detailLabel}>Your Rating:</span> {myReview.rating} / 5</p>
                            <p><span className={styles.detailLabel}>Your Comment:</span> {myReview.comment}</p>
                            <div className={styles.buttonGroup}>
                                <button 
                                    className={styles.submitButton}
                                    onClick={() => {
                                        setReviewForm({ rating: myReview.rating, comment: myReview.comment })
                                        setShowReviewModal(true)
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to delete this review?")) {
                                            try {
                                                await axiosInstance.delete(`/reviews/${id}`)
                                                const res = await axiosInstance.get(`/reviews/${id}`, { params: { page: 1 } })
                                                setReviews(res.data.data)
                                                setReviewLastPage(res.data.meta.lastPage)
                                                if (user) {
                                                    const mine = res.data.data.find(r => r.user?.id === user.id)
                                                    setMyReview(mine)
                                                }

                                                setShowReviewModal(false)
                                                setReviewPage(1)
                                            } catch (err) {
                                                alert(err.response?.data?.message || "Delete failed")
                                            }
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            className={styles.submitButton}
                            onClick={async () => {
                                try {
                                    const res = await axiosInstance.get(`/reviews/eligible/${id}`)
                                    if (!res.data.eligible) {
                                        alert("You can only review this product after purchasing it")
                                        return
                                    }
                                    setReviewForm({ rating: 5, comment: "" })
                                    setShowReviewModal(true)
                                } catch (err) {
                                    alert("Failed to check review eligibility", err)
                                }
                            }}
                        >
                            Leave a Review
                        </button>
                    )}
                </section>

                {showReviewModal && (
                    <div className={styles.reviewModal}>
                        <h3 className={styles.modalTitle}>{myReview ? "Edit Review" : "Add Review"}</h3>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Rating (1-5):</label>
                            <input
                                className={styles.ratingInput}
                                type="number"
                                value={reviewForm.rating}
                                min={1}
                                max={5}
                                onChange={e => setReviewForm(f => ({ ...f, rating: +e.target.value }))}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Comment:</label>
                            <textarea
                                className={styles.commentTextarea}
                                value={reviewForm.comment}
                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.submitButton}
                                onClick={async () => {
                                    try {
                                        if (myReview) {
                                            await axiosInstance.put(`/reviews/${id}`, reviewForm)
                                        } else {
                                            await axiosInstance.post(`/reviews/${id}`, reviewForm)
                                        }
                                        const res = await axiosInstance.get(`/reviews/${id}`, { params: { page: 1 } })
                                        setReviews(res.data.data)
                                        setReviewLastPage(res.data.meta.lastPage)
                                        if (user) {
                                            const mine = res.data.data.find(r => r.user?.id === user.id)
                                            setMyReview(mine)
                                        }

                                        setShowReviewModal(false)
                                        setReviewPage(1)
                                    } catch (err) {
                                        alert(err.response?.data?.message || "Failed to submit review")
                                    }
                                }}
                            >
                                Submit
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setShowReviewModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <hr className={styles.divider} />

                {/* All reviews section */}
                <section className={styles.reviewsSection}>
                    <h2 className={styles.reviewsHeading}>Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className={styles.emptyMessage}>No reviews yet.</p>
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <img
                                        className={styles.reviewerImage}
                                        src={r.user.imageUrl.startsWith("http") ? r.user.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${r.user.imageUrl}`}
                                        alt={r.user.name}
                                    />
                                    <div className={styles.reviewerInfo}>
                                        <p className={styles.reviewerName}>{r.user?.name}</p>
                                        <p className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={styles.rating}>Rating: {r.rating} / 5</p>
                                <p className={styles.reviewText}>{r.comment}</p>
                            </div>
                        ))
                    )}

                    {/* pagination */}
                    {reviewLastPage !== 0 && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setReviewPage(p => Math.max(p - 1, 1))}
                                disabled={reviewPage === 1}
                            >
                                Prev
                            </button>
                            <span className={styles.paginationText}>
                                Page {reviewPage} of {reviewLastPage}
                            </span>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setReviewPage(p => Math.min(p + 1, reviewLastPage))}
                                disabled={reviewPage === reviewLastPage}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </>
    )
}