"use client"
import { useState, useEffect } from "react"
import styles from "../styles/seller/modalSell.module.css"

export default function SellerProductModal({
    isOpen, onClose, onSubmit, initial = {
        name: "", price: "", imageUrl: "", stock: "",
        description: "", usageInstructions: "", ingredients: "", diseaseTargets: []
    }, submitLabel
}) {
    const [name, setName] = useState(initial.name)
    const [price, setPrice] = useState(initial.price)
    const [stock, setStock] = useState(initial.stock)
    const [description, setDescription] = useState(initial.description)
    const [usageInstructions, setUsageInstructions] = useState(initial.usageInstructions)
    const [ingredients, setIngredients] = useState(initial.ingredients)
    const [diseaseTargets, setDiseaseTargets] = useState(initial.diseaseTargets || [])
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(initial.imageUrl)
    const diseaseOptions = ['Apple - Apple scab', 'Apple - Black rot', 'Apple - Cedar apple rust',
        'Cherry (including sour) - Powdery mildew', 'Corn (maize) - Cercospora leaf spot Gray leaf spot',
        'Corn (maize) - Common rust ', 'Corn (maize) - Northern Leaf Blight', 'Grape - Black rot',
        'Grape - Esca (Black Measles)', 'Grape - Leaf blight (Isariopsis Leaf Spot)',
        'Orange - Haunglongbing (Citrus greening)', 'Peach - Bacterial spot', 'Pepper, bell - Bacterial spot',
        'Potato - Early blight', 'Potato - Late blight', 'Squash - Powdery mildew', 'Strawberry - Leaf scorch',
        'Tomato - Bacterial spot', 'Tomato - Early blight', 'Tomato - Late blight', 'Tomato - Leaf Mold',
        'Tomato - Septoria leaf spot', 'Tomato - Spider mites Two-spotted spider mite', 'Tomato - Target Spot',
        'Tomato - Tomato Yellow Leaf Curl Virus', 'Tomato - Tomato mosaic virus']

    useEffect(() => {
        setName(initial.name)
        setPrice(initial.price)
        setStock(initial.stock)
        setDescription(initial.description || "")
        setUsageInstructions(initial.usageInstructions || "")
        setIngredients(initial.ingredients || "")
        setDiseaseTargets(initial.diseaseTargets || [])
        setPreview(initial.imageUrl)
        setFile(null)
    }, [initial])

    if (!isOpen) return null

    const handleDiseaseCheckboxChange = (e) => {
        const { value, checked } = e.target
        setDiseaseTargets(prevDiseaseTargets => {
            if (checked) {
                return [...new Set([...prevDiseaseTargets, value])]
            } else {
                return prevDiseaseTargets.filter(d => d !== value)
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!file && !preview) return alert("Image is required")

        onSubmit({
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            usageInstructions,
            ingredients,
            diseaseTargets,
            file,
            currentImage: preview
        })
        handleClose()
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{submitLabel}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Product Name"
                        required
                    />

                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="Price"
                        required
                    />

                    <input
                        type="number"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                        placeholder="Stock"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                    />

                    <textarea
                        value={usageInstructions}
                        onChange={e => setUsageInstructions(e.target.value)}
                        placeholder="Usage Instructions (optional)"
                    />

                    <textarea
                        value={ingredients}
                        onChange={e => setIngredients(e.target.value)}
                        placeholder="Ingredients (optional)"
                    />

                    <div className={styles.diseaseTargetsGroup}>
                        <label>Disease Targets</label>
                        {diseaseOptions.map(option => (
                            <div key={option} className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    id={`disease-${option}`}
                                    name="diseaseTargets"
                                    value={option}
                                    checked={diseaseTargets.includes(option)}
                                    onChange={handleDiseaseCheckboxChange}
                                    className={styles.checkboxInput}
                                />
                                <label htmlFor={`disease-${option}`}>{option}</label>
                            </div>
                        ))}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            setFile(e.target.files[0])
                            setPreview(URL.createObjectURL(e.target.files[0]))
                        }}
                    />
                    {preview && <img src={preview} alt="Product Preview" className={styles.modalImagePreview} />}

                    <button type="submit">{submitLabel}</button>
                    <button type="button" onClick={handleClose} className={styles.cancelButton}>Cancel</button>
                </form>
            </div>
        </div>
    )
}