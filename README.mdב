# 🎨 AI Models Laboratory (Pollinations Gallery)

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
</p>

---

### 🌟 Overview
A high-performance, fully responsive web application that generates images from a single text prompt across **9 different state-of-the-art AI models** simultaneously.

Built to demonstrate advanced API handling, sequential asynchronous loading, and rate-limit bypassing.

---

## ✨ Key Features

- **🔄 Multi-Model Generation**: Compare how 9 different models (Flux, Imagen, Grok, etc.) interpret the exact same prompt in real-time.
- **⏳ Smart Queue System**: Implements a sequential `async/await` loading mechanism with built-in cooldowns (**4s success / 10s error**) to prevent "Queue Full" errors.
- **🔐 Pro-Tier Authentication**: Securely sends your Pollinations API key via `Authorization: Bearer` headers.
- **☁️ Cloud Sync (Firebase)**: Saves your API key, generated image count, and prompt history securely to Firestore.
- **🎨 Modern UI**: Beautiful **Glassmorphism** design, fully responsive, with Dark/Light mode and full **RTL (Hebrew)** / LTR (English) support.

---

## 🚀 Models Included

| Model Name | API Slug | Characteristics |
| :--- | :--- | :--- |
| **Flux Schnell** | `flux` | Ultra-fast generation |
| **FLUX.2 Dev** | `flux-2-dev` | High fidelity |
| **Dirtberry** | `dirtberry` | Artistic / Stylized |
| **Imagen 4** | `imagen-4` | Photorealistic |
| **Grok Imagine** | `grok-imagine` | X/Twitter style AI |
| **FLUX.2 Klein (4B/9B)** | `klein` / `klein-large` | Efficient & Detailed |

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, JavaScript (ES6+), **Tailwind CSS** (via CDN).
* **Icons:** Lucide Icons.
* **Backend:** Firebase Authentication & Firestore.
* **API:** `gen.pollinations.ai`

---

## 📦 How to Run

### Option 1: Live Web App 🌐
Simply host the code on any static hosting provider (**Vercel, GitHub Pages, Lovable**). 
1. Open the app in your browser.
2. Click **"Login"**.
3. Provide your Pollinations API key to start generating.

### Option 2: Local Python Testing Script 🐍
This repository includes a `test_models.py` script to test the API directly from your terminal.

```bash
# 1. Install requirements
pip install requests

# 2. Set your API Key
# On Mac/Linux:
export POLLINATIONS_API_KEY="sk_your_secret_key"
# On Windows (CMD):
set POLLINATIONS_API_KEY="sk_your_secret_key"

# 3. Run the script
python test_models.py
⚠️ Important Note for AI Builders (Lovable, v0, etc.)
If you are importing this project into an AI builder, please refer to ai_project_spec.md for the strict implementation logic.

Warning: Firing 9 models simultaneously will result in 429 Too Many Requests errors. You must use the sequential loading logic provided.

📜 License
This project is licensed under the MIT License.

<p align="center">
Made with ❤️ for the AI Community
</p>
