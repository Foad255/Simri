# Simri: AI-Powered MRI Similarity Search for Faster Insights

The traditional diagnostic journey can mean weeks or months of uncertainty, a heavy emotional burden for patients and their families.

---

## 🧠 The Problem: From Scan to Diagnosis

When a brain tumor is suspected, the path to understanding is often slow and filled with anxiety. After an MRI, patients can wait weeks for detailed analysis and to understand their prognosis. This waiting period is a major challenge, leaving them with unanswered questions and significant stress.

* How aggressive is the tumor?
* Has anyone had something that looks like this before?
* What can I expect?

---

## 💡 The Solution: Introducing Simri

Simri empowers patients and clinicians by providing instant, data-driven insights from visually similar cases.

It bridges the gap between the initial scan and deep insights. It's a powerful research platform that uses state-of-the-art AI to instantly find similar patient cases from a vast medical imaging database based on the unique features of a tumor's MRI scans.

> Instead of waiting, imagine uploading an MRI and immediately seeing visually similar cases, complete with their diagnostic information.

This accelerates understanding, aids research, and provides a data-driven foundation for discussion—turning weeks of uncertainty into moments of clarity.

---

## ✨ Key Features

* **🧠 AI-Powered Similarity**
  Utilizes a custom deep learning model (TIEP) to generate a unique "embedding" or fingerprint for each patient's multi-sequence MRI.

* **⚡ Blazing Fast Search**
  Leverages MongoDB's Vector Search to instantly find the closest matching patient profiles in a large database.

* **📂 Secure MRI Upload**
  Easily upload the five key MRI sequences (`t1ce`, `t1n`, `t2f`, `t2w`, and `seg`) directly to the platform.

* **📊 Interactive Visualization**
  View and compare MRI scans side-by-side using the integrated Niivue web-based medical image viewer.

* **🔬 Explore BraTS Dataset**
  The platform is pre-loaded with data from the BraTS (Brain Tumor Segmentation) challenge, providing a rich repository for comparison.

---

## ⚙️ How It Works

The process is designed to be seamless, transforming raw MRI files into actionable, comparative insights.

**Workflow:**

```
Upload Scans 📤 ➔ Generate AI Embedding 🧠 ➔ Vector Search ⚡ ➔ Visualize & Compare 📊
```

---

### 🧱 System Architecture

```
+----------------+      +-----------------------+      +-------------------+
|                | (1)  |                       | (2)  |                   |
|   User on      |----->|   Next.js/React Web   |----->|   AWS S3 Bucket   |
|   Browser      |      |   Server (Frontend)   |      | (MRI File Storage)|
|                |      |                       |      |                   |
+----------------+      +-----------+-----------+      +-------------------+
                                    | (3)
                                    |
                                    v
                       +-----------------------+
                       |                       |
                       |  Hugging Face API     |
                       |  - TIEP AI Model -    |
                       |                       |
                       +-----------+-----------+
                                   | (4)
                                   |
                                   v
                       +-----------------------+
                       |                       |
                       |   MongoDB Atlas       |
                       | (Vector Search)       |
                       |                       |
                       +-----------------------+
```

**Steps:**

1. The user uploads MRI files via the **Next.js** frontend.
2. Files are securely uploaded to an **AWS S3 bucket**.
3. File URLs are sent to the **Hugging Face API**, where the **TIEP model** generates a vector embedding.
4. The embedding is used for a **similarity search** against the **MongoDB Atlas vector database** to retrieve the most similar patient records.

---

### 🧰 Tech Stack

**Frontend:**

* Next.js
* TypeScript
* Niivue (for image visualization)

**Backend & AI:**

* Python (FastAPI or Flask)
* Hugging Face Spaces (TIEP model deployment)

**Database & Infrastructure:**

* MongoDB Atlas (with Vector Search)
* AWS S3 (for MRI file storage)

---

### 🚀 Getting Started

Follow these steps to get a local copy of the frontend up and running.

#### ✅ Prerequisites

* Node.js (v18 or later)
* MongoDB Atlas cluster with Vector Search configured
* AWS account with S3 bucket and IAM credentials

#### 🔧 Installation & Setup

Clone the repository:

```bash
git clone https://github.com/your-username/simri.git
cd simri
```

Install frontend dependencies:

```bash
cd frontend  # or your frontend folder name
npm install
```

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_s3_bucket_region
S3_BUCKET_NAME=your_s3_bucket_name

# Backend API URL (Hugging Face Space)
NEXT_PUBLIC_FLASK_API_URL=https://fouad300-ml-service-embedding-api.hf.space
```

Start the frontend app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### ⚠️ Important Disclaimer

This is a research and educational tool. It is **NOT** a medical device.

The information and analysis provided by Simri are for informational purposes only and should not be used for self-diagnosis or as a substitute for professional medical advice, diagnosis, or treatment.

Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
