"use client"
import { useState, useEffect } from "react"
import styles from "../styles/marketplace.module.css"

export default function FilterDiseaseModal({
    visible, onClose, selectedDiseases, onApply
}) {
    const [tempSelected, setTempSelected] = useState([])
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
        if (visible) {
            setTempSelected(selectedDiseases)
        }
    }, [visible, selectedDiseases])

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target
        setTempSelected(prev =>
            checked ? [...new Set([...prev, value])] : prev.filter(d => d !== value)
        )
    }

    const handleApply = () => {
        onApply(tempSelected)
        onClose()
    }

    const handleReset = () => {
        setTempSelected([])
        onApply([])
        onClose()
    }

    if (!visible) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div style={{backgroundColor: 'white', padding: 30, borderRadius: 20}} onClick={e => e.stopPropagation()}>
                <h3 style={{marginBottom: 20}}>Select Disease</h3>
                <div style={{}}>
                    {diseaseOptions.map(option => (
                        <div key={option} className={styles.modalDiseaseCheckboxItem}>
                            <input
                                type="checkbox"
                                id={option}
                                value={option}
                                checked={tempSelected.includes(option)}
                                onChange={handleCheckboxChange}
                                className={styles.checkboxInput}
                            />
                            <label htmlFor={option}>{option}</label>
                        </div>
                    ))}
                </div>
                <div className={styles.modalActions}>
                    <button onClick={handleApply} className={styles.filtersButton}>Apply</button>
                    <button onClick={handleReset} className={styles.filtersButton}>Reset</button>
                </div>
            </div>
        </div>
    )
}