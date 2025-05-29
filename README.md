# Simri — MRI Similarity Search Tool

**Simri** is a deep learning-powered tool to find and visualize patients with similar MRI scans. Using embeddings generated from multiple MRI modalities, Simri enables researchers and clinicians to quickly find patients with comparable imaging features from large datasets.

---

## **Features**

- **Upload** new patient MRI scans (T1C, T1, T2-FLAIR, T2, and segmentation).
- **Automated embedding generation** via TIEP deep learning model.
- **Vector similarity search** on MongoDB for fast retrieval of similar patients.
- **Visualization** of MRI scans side-by-side using Niivue.
- **Integration** with BraTS2025 dataset on MongoDB.
- **Scalable storage** on AWS S3.

---

## **How It Works**

1. Upload your MRI scans through the **Next.js frontend**.
2. Scans are stored on **AWS S3**.
3. Frontend sends storage keys to **Flask backend** hosting the **TIEP model**.
4. TIEP model generates patient embedding vectors from the five MRI scans.
5. Embeddings are used to perform **vector similarity search** in MongoDB.
6. Similar patient scans are fetched and displayed side-by-side with your query using **Niivue**.

---

## **Tech Stack**

- **Frontend:** Next.js, Niivue (3D MRI visualization)
- **Backend:** Flask (deep learning inference)
- **Deep Learning Model:** TIEP (embedding generation from multi-modal MRI)
- **Database:** MongoDB with vector search
- **Storage:** AWS S3

---

## **Getting Started**

*(Instructions to run locally, environment setup, dependencies, API details, etc.)*

---

## **Dataset**

We use the **BraTS2025 dataset** hosted in MongoDB for similarity search.
*(Mention licensing or data access details)*

---

## **Future Work**

- Improve model accuracy and embedding quality.
- Add user authentication and data privacy features.
- Extend to other imaging modalities or clinical data.
