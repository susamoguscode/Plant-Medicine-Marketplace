import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import axiosInstance from "@/axiosInstance"
import SellerProductModal from "@/components/SellerProuctModal"
import { useRouter } from "next/router"
import styles from  "../../styles/seller/productSell.module.css"

export default function SellerProducts() {
    const { user, loading } = useAuth()
    const [products, setProducts] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (user?.role !== "seller") {
                router.push("/")
            } else {
                fetchProducts()
            }
        }
    }, [user, loading, page])

    async function fetchProducts() {
        const res = await axiosInstance.get(`/products/seller/${user.id}`, {
            params: { page }
        })
        setProducts(res.data.data)
        setTotalPages(res.data.meta.lastPage)
    }

    const handleCreateOrUpdate = async ({
        name, price, file, currentImage, stock, description,
        diseaseTargets, usageInstructions, ingredients
    }) => {
        const formData = new FormData()
        formData.append("name", name)
        formData.append("price", price)
        formData.append("stock", stock)
        formData.append("description", description)
        formData.append("usageInstructions", usageInstructions)
        formData.append("ingredients", ingredients)

        if (Array.isArray(diseaseTargets)) {
            diseaseTargets.forEach(disease => {
                formData.append("diseaseTargets[]", disease)
            })
        }

        if (file) {
            formData.append("image", file)
        } else if (currentImage) {
            formData.append("imageUrl", currentImage)
        }

        try {
            if (editProduct) {
                await axiosInstance.put(
                    `/products/${editProduct.id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                )
            } else {
                await axiosInstance.post(
                    "/products",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                )
            }

            fetchProducts()
            setEditProduct(null)
            setModalOpen(false)
        } catch (err) {
            console.error("Save failed", err)
            alert("Failed to save product")
        }
    }

    const openCreateModal = () => {
        setEditProduct(null)
        setModalOpen(true)
    }

    const openEditModal = (product) => {
        setEditProduct(product)
        setModalOpen(true)
    }

    if (loading) return <p>Loading…</p>

    return (
        <main className={styles.page}>
            <h1>Your Products</h1>
            <button className={styles.addButton} onClick={openCreateModal}>
                + Add Product
            </button>

            <ul className={styles.productList}>
                {products.map(p => (
                    <li className={styles.productCard} key={p.id}>
                        {p.imageUrl && (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${p.imageUrl}`}
                                alt={p.name}
                            />
                        )}
                        <h3>{p.name}</h3>
                        <p>Rating: {p.rating ?? "N/A"}</p>
                        <p>Price: Rp {Number(p.price).toLocaleString("id-ID")}</p>
                        <p>Stock: {p.stock}</p>
                        <button onClick={() => openEditModal(p)}>Edit</button>
                        <button
                            onClick={async () => {
                                await axiosInstance.delete(`/products/${p.id}`)
                                fetchProducts()
                            }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {totalPages > 0 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        Prev
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <SellerProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initial={editProduct || {
                    name: "",
                    price: "",
                    imageUrl: "",
                    stock: "",
                    description: "",
                    diseaseTargets: [],
                    usageInstructions: "",
                    ingredients: ""
                }}
                submitLabel={editProduct ? "Update Product" : "Create Product"}
            />
        </main>
    )
}
