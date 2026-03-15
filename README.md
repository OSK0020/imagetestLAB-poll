🎨 AI Models Laboratory (Pollinations Gallery)

A high-performance, fully responsive web application that generates images from a single text prompt across 9 different state-of-the-art AI models simultaneously.

Built to demonstrate advanced API handling, sequential asynchronous loading, and rate-limit bypassing.

✨ Features

Multi-Model Generation: See how 9 different models (Flux, Imagen, Grok, etc.) interpret the exact same prompt.

Smart Queue System: Implements a sequential async/await loading mechanism with built-in cooldowns (4s success / 10s error) to prevent "Queue Full" errors and handle rate limits gracefully.

Pro-Tier Authentication: Securely sends your Pollinations API key via Authorization: Bearer headers (falling back to URL parameters if CORS restricts it).

Cloud Sync (Firebase): Saves your API key, generated image count, and prompt history securely to Firestore.

Beautiful UI: Glassmorphism design, fully responsive, with Dark/Light mode and full RTL (Hebrew) / LTR (English) support.

🚀 Models Included

Flux Schnell (flux)

FLUX.2 Dev (flux-2-dev)

Dirtberry (dirtberry)

Z-Image Turbo (zimage)

Imagen 4 (imagen-4)

Grok Imagine (grok-imagine)

FLUX.2 Klein 4B (klein)

GPT Image 1 Mini (gptimage)

FLUX.2 Klein 9B (klein-large)

🛠️ Tech Stack

Frontend: HTML5, JavaScript, Tailwind CSS (via CDN).

Icons: Lucide Icons.

Backend / Database: Firebase Authentication & Firestore.

Image Generation: gen.pollinations.ai API.

📦 How to Run

Option 1: Live Web App (Lovable / Vercel / GitHub Pages)

Simply host the code on any static hosting provider. The app runs entirely in the browser. You will need to click the "Login" button and provide your pollinations.ai API key to generate images without restrictions.

Option 2: Local Python Testing Script

This repository includes a test_models.py script to test the Pollinations API directly from your terminal.

Install requirements:

pip install requests


Set your API Key as an environment variable:

# On Mac/Linux
export POLLINATIONS_API_KEY="sk_your_secret_key"

# On Windows (CMD)
set POLLINATIONS_API_KEY="sk_your_secret_key"


Run the script:

python test_models.py


The script will generate images sequentially and save them to your local folder.

⚠️ Important Note for AI Builders (Lovable, v0, etc.)

If you are importing this project into an AI builder, please refer to ai_project_spec.md for the strict implementation logic regarding Sequential Loading and Cooldowns. Firing 9 models simultaneously will result in 429 Too Many Requests errors.

📜 License

This project is licensed under the MIT License.
