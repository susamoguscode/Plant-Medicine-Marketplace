import { useEffect, useState } from "react";
import axiosInstance from "@/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import styles from '../../styles/admin/adminProducts.module.css';
import FilterDiseaseModal from "@/components/FilterDiseaseModal";

export default function AdminProductsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [filterDiseases, setFilterDiseases] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [diseaseModalVisible, setDiseaseModalVisible] = useState(false)

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
        usageInstructions: "",
        ingredients: "",
        diseaseTargets: [],
        image: null
    });

    const diseaseOptions = ['Apple - Apple scab', 'Apple - Black rot', 'Apple - Cedar apple rust',
        'Cherry (including sour) - Powdery mildew', 'Corn (maize) - Cercospora leaf spot Gray leaf spot',
        'Corn (maize) - Common rust ', 'Corn (maize) - Northern Leaf Blight', 'Grape - Black rot',
        'Grape - Esca (Black Measles)', 'Grape - Leaf blight (Isariopsis Leaf Spot)',
        'Orange - Haunglongbing (Citrus greening)', 'Peach - Bacterial spot', 'Pepper, bell - Bacterial spot',
        'Potato - Early blight', 'Potato - Late blight', 'Squash - Powdery mildew', 'Strawberry - Leaf scorch',
        'Tomato - Bacterial spot', 'Tomato - Early blight', 'Tomato - Late blight', 'Tomato - Leaf Mold',
        'Tomato - Septoria leaf spot', 'Tomato - Spider mites Two-spotted spider mite', 'Tomato - Target Spot',
        'Tomato - Tomato Yellow Leaf Curl Virus', 'Tomato - Tomato mosaic virus']

    const fetchProducts = async () => {
        try {
            const params = { page };
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (search) params.search = search;
            if (sort) params.sort = sort;
            if (filterDiseases.length > 0) {
                params.disease = filterDiseases.join(',');
            }

            const res = await axiosInstance.get("/products/allproducts", { params });
            setProducts(res.data.data);
            setTotalPages(res.data.meta.lastPage);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    useEffect(() => {
        if (!loading) {
            if (user?.role === "admin") {
                fetchProducts();
            } else {
                router.replace("/");
                return;
            }
        }
    }, [loading, user, page, sort, minPrice, maxPrice, search, filterDiseases]);

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            usageInstructions: product.usageInstructions,
            ingredients: product.ingredients,
            diseaseTargets: product.diseaseTargets || [],
            image: null
        });
    };

    const closeModal = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            price: "",
            stock: "",
            description: "",
            usageInstructions: "",
            ingredients: "",
            diseaseTargets: [],
            image: null
        });
    };

    const handleDiseaseCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prevFormData => {
            const currentDiseaseTargets = prevFormData.diseaseTargets || [];
            if (checked) {
                return {
                    ...prevFormData,
                    diseaseTargets: [...new Set([...currentDiseaseTargets, value])]
                };
            } else {
                return {
                    ...prevFormData,
                    diseaseTargets: currentDiseaseTargets.filter(d => d !== value)
                };
            }
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append("name", formData.name);
            form.append("price", formData.price);
            form.append("stock", formData.stock);
            form.append("description", formData.description);
            form.append("usageInstructions", formData.usageInstructions);
            form.append("ingredients", formData.ingredients);

            if (Array.isArray(formData.diseaseTargets)) {
                formData.diseaseTargets.forEach(disease => {
                    form.append("diseaseTargets[]", disease);
                });
            }

            if (formData.image) {
                form.append("image", formData.image);
            }

            await axiosInstance.put(`/products/${editingProduct.id}`, form);
            await fetchProducts();
            closeModal();
        } catch (err) {
            console.error("Failed to update product", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await axiosInstance.delete(`/products/${id}`);
            await fetchProducts();
        } catch (err) {
            console.error("Failed to delete product", err);
        }
    };

    if (loading || user?.role !== "admin") return <p className={styles.loadingOrUnauthorized}>Loading or Unauthorized</p>;

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Admin - Manage Products</h1>

            <div className={styles.filters}>
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className={styles.filtersInput}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className={styles.filtersInput}
                />
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.filtersInput}
                />
                <button onClick={() => setDiseaseModalVisible(true)} className={styles.filtersButton}>
                    {filterDiseases.length > 0 ? `${filterDiseases.length} selected` : "Select Diseases"}
                </button>

                <FilterDiseaseModal
                    visible={diseaseModalVisible}
                    selectedDiseases={filterDiseases}
                    onApply={setFilterDiseases}
                    onClose={() => setDiseaseModalVisible(false)}
                />
                <select value={sort} onChange={e => setSort(e.target.value)} className={styles.filtersSelect}>
                    <option value="">Sort</option>
                    <option value="price_asc">Price Low → High</option>
                    <option value="price_desc">Price High → Low</option>
                    <option value="rating_desc">Rating High → Low</option>
                </select>
                <button onClick={fetchProducts} className={styles.filtersButton}>Apply Filters</button>
            </div>

            {products.length === 0 ? (
                <p className={styles.noProducts}>No products found.</p>
            ) : (
                <ul className={styles.grid}>
                    {products.map(product => (
                        <li key={product.id} className={styles.card}>
                            {product.imageUrl && (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                                    alt={product.name}
                                />
                            )}
                            <div className={styles.cardContent}>
                                <h2>{product.name}</h2>
                                <p className={styles.price}>Rp {Number(product.price).toLocaleString("id-ID")}</p>
                                {product.seller && (
                                    <div className={styles.seller}>
                                        <img
                                            src={product.seller.imageUrl.startsWith("http") ? product.seller.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                                            alt={product.seller.name}
                                        />
                                        <span>{product.seller.name}</span>
                                    </div>
                                )}
                                {product.rating != null && <p className={styles.rating}>Rating: {product.rating.toFixed(1)} ★</p>}
                                <p className={styles.stock}>Stock: {product.stock}</p>
                            </div>
                            <div className={styles.cardActions}>
                                <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => openEditModal(product)}>Edit</button>
                                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(product.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

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

            {editingProduct && (
                <div className={styles.modalOverlay}>
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                        <h2 className={styles.modalHeading}>Edit Product</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="editName">Name</label>
                            <input
                                id="editName"
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editPrice">Price</label>
                            <input
                                id="editPrice"
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editStock">Stock</label>
                            <input
                                id="editStock"
                                type="number"
                                placeholder="Stock"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editDescription">Description</label>
                            <textarea
                                id="editDescription"
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editUsageInstructions">Usage Instructions</label>
                            <textarea
                                id="editUsageInstructions"
                                placeholder="Usage Instructions"
                                value={formData.usageInstructions}
                                onChange={e => setFormData({ ...formData, usageInstructions: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editIngredients">Ingredients</label>
                            <textarea
                                id="editIngredients"
                                placeholder="Ingredients"
                                value={formData.ingredients}
                                onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.modalDiseaseTargets}`}>
                            <label>Disease Targets</label>
                            {diseaseOptions.map(option => (
                                <div key={option} className={styles.modalDiseaseCheckboxItem}>
                                    <input
                                        type="checkbox"
                                        id={`modal-${option}`}
                                        name="diseaseTargets"
                                        value={option}
                                        checked={formData.diseaseTargets.includes(option)}
                                        onChange={handleDiseaseCheckboxChange}
                                        className={styles.checkboxInput}
                                    />
                                    <label htmlFor={`modal-${option}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editImage">Product Image</label>
                            <input
                                id="editImage"
                                type="file"
                                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button type="submit" className={`${styles.modalButton} ${styles.saveButton}`}>Save</button>
                            <button type="button" onClick={closeModal} className={`${styles.modalButton} ${styles.cancelButton}`}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}