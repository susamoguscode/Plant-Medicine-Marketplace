import { useCallback, useEffect, useRef, useState } from "react"
import axiosInstance from "../axiosInstance"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"
import styles from "../styles/marketplace.module.css"
import FilterDiseaseModal from "@/components/FilterDiseaseModal"

export default function Marketplace() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [filterDiseases, setFilterDiseases] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [readyToFetch, setReadyToFetch] = useState(false)
  const [diseaseModalVisible, setDiseaseModalVisible] = useState(false)
  
  const hasInitialUrlFilterBeenApplied = useRef(false)

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin/users")
    }
  }, [loading, user, router])

  const fetchProducts = useCallback(async () => {
    try {
      const params = { page }
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (search) params.search = search
      if (sort) params.sort = sort
      if (filterDiseases.length > 0) {
        params.disease = filterDiseases.join(',')
      }

      const res = await axiosInstance.get("/products", { params })
      setProducts(res.data.data)
      setTotalPages(res.data.meta.lastPage)
    } catch (error) {
      console.error("Failed to fetch products", error)
    }
  }, [page, minPrice, maxPrice, search, sort, filterDiseases])

  useEffect(() => {
    if (!router.isReady || hasInitialUrlFilterBeenApplied.current) return

    const { minPrice, maxPrice, search, sort, disease, page } = router.query

    if (minPrice) setMinPrice(String(minPrice))
    if (maxPrice) setMaxPrice(String(maxPrice))
    if (search) setSearch(String(search))
    if (sort) setSort(String(sort))
    if (disease) {
      const diseasesFromUrl = String(disease).split(',').map(d => d.trim()).filter(Boolean)
      setFilterDiseases(diseasesFromUrl)
    }
    if (page) setPage(Number(page))

    hasInitialUrlFilterBeenApplied.current = true
    setReadyToFetch(true)
  }, [router.isReady, router.query])

  useEffect(() => {
    if (!hasInitialUrlFilterBeenApplied.current) return

    const query = {}

    if (minPrice) query.minPrice = minPrice
    if (maxPrice) query.maxPrice = maxPrice
    if (search) query.search = search
    if (sort) query.sort = sort
    if (filterDiseases.length > 0) query.disease = filterDiseases.join(',')
    if (page !== 1) query.page = String(page)

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
  }, [minPrice, maxPrice, search, sort, filterDiseases, page])

  useEffect(() => {
    if (readyToFetch) {
      fetchProducts()
    }
  }, [readyToFetch, page, sort, minPrice, maxPrice, search, filterDiseases])

  if (loading || user?.role === "admin") return null

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Marketplace</h1>

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
        <button onClick={fetchProducts} className={styles.filtersButton}>Apply</button>
      </div>

      {products.length === 0 ? (
        <p className={styles.noProducts}>No products found</p>
      ) : (
        <ul className={styles.grid}>
          {products.map(product => (
            <li key={product.id} className={styles.card}>
              <Link href={`/product/${product.id}`} className={styles.link}>
                {product.imageUrl && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                    alt={product.name}
                  />
                )}
                <div className={styles.cardContent}>
                  <h2>{product.name}</h2>
                  <p className={styles.price}>Price: Rp {Number(product.price).toLocaleString("id-ID")}</p>
                  <div className={styles.seller}>
                    <img
                      src={product.seller.imageUrl.startsWith("http")
                        ? product.seller.imageUrl
                        : `${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                      alt={product.seller.name}
                    />
                    <p>{product.seller.name}</p>
                  </div>
                  {product.rating != null && <p className={styles.rating}>Rating: {product.rating} ★</p>}
                  <p className={styles.stock}>Stock: {product.stock}</p>
                </div>
              </Link>
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
    </main>
  )
}