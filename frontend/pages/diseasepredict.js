import { useRouter } from "next/router"
import React, { useState } from "react"

export default function DiseasePredict() {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState(null)
    const [predictionResult, setPredictionResult] = useState(null)
    const [loadingPrediction, setLoadingPrediction] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewImage(URL.createObjectURL(file))
            setPredictionResult(null)
        } else {
            setSelectedFile(null)
            setPreviewImage(null)
        }
    }

    const handlePredict = async () => {
        if (!selectedFile) {
            alert("Please select an image first.")
            return
        }

        setLoadingPrediction(true)
        setPredictionResult(null)

        const formData = new FormData()
        formData.append('image', selectedFile)

        try {
            const response = await fetch('http://127.0.0.1:5001/predict', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
                console.error("Prediction failed:", errorMessage)
                alert(`Prediction failed: ${errorMessage}`)
                return
            }

            const data = await response.json()
            setPredictionResult(data)
        } catch (err) {
            console.error("Prediction failed:", err)
            alert(`Prediction failed: ${err.message}`)
        } finally {
            setLoadingPrediction(false)
        }
    }

    const handleFindMedicine = () => {
        if (predictionResult && !predictionResult.predicted_class.toLowerCase().includes("healthy")) {
            const diseaseToFilter = predictionResult.predicted_class
            router.push(`/?disease=${encodeURIComponent(diseaseToFilter)}`)
        }
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>🌿 Leaf Disease Detector</h1>
            <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
                Upload an image of a corn leaf to detect possible diseases.
            </p>

            <div style={{ marginBottom: '1.5rem', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                    Choose a leaf image:
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {previewImage && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <img src={previewImage} alt="Selected Leaf Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                    </div>
                )}
            </div>

            <button
                onClick={handlePredict}
                disabled={!selectedFile || loadingPrediction}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {loadingPrediction ? 'Predicting...' : 'Predict Disease'}
            </button>

            {/* Removed the error display element */}
            {predictionResult && (
                <div style={{ marginTop: '2.5rem', border: '1px solid #007bff', padding: '2rem', borderRadius: '10px', backgroundColor: '#e7f3ff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#0056b3', marginBottom: '1rem' }}>Prediction Results:</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        <strong>Predicted Disease:</strong> <span style={{ fontWeight: 'bold', color: '#333' }}>{predictionResult.predicted_class}</span>
                    </p>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        <strong>Confidence:</strong> <span style={{ fontWeight: 'bold', color: '#333' }}>{(predictionResult.confidence * 100).toFixed(2)}%</span>
                    </p>

                    <h3 style={{ color: '#0056b3', marginBottom: '0.8rem' }}>Class Probabilities</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {Object.entries(predictionResult.probabilities).map(([className, prob]) => (
                            <li key={className} style={{ marginBottom: '0.3rem', backgroundColor: '#f0f8ff', padding: '0.5rem', borderRadius: '4px' }}>
                                <span style={{ fontWeight: '500' }}>{className}:</span> {(prob * 100).toFixed(2)}%
                            </li>
                        ))}
                    </ul>

                    {!predictionResult.predicted_class.toLowerCase().includes("healthy") && (
                        <button
                            onClick={handleFindMedicine}
                            style={{
                                display: 'block',
                                width: '100%',
                                marginTop: '2rem',
                                padding: '1rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                            }}
                        >
                            Find Medicine for {predictionResult.predicted_class}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}