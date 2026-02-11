import requests
import os
import time

# --- המפתח שלך ---
API_KEY = "sk_4syyCnDbIaq77tGp1aEBptIEr6vz4yCA"

# --- רשימת המודלים לבדיקה ---
MODELS = {
    "flux": "Flux Schnell",
    "zimage": "Z-Image Turbo",
    "imagen-4": "Google Imagen 4 (Alpha)",
    "klein": "FLUX.2 Klein 4B",
    "klein-large": "FLUX.2 Klein 9B",
    "gptimage": "GPT Image 1 Mini"
}

PROMPT = "A futuristic cyberpunk street food vendor in Tokyo, neon lights, rain, highly detailed, 8k resolution"

print("🚀 Starting Manual Model Test...")

for code, name in MODELS.items():
    print(f"\n📸 Testing {name} ({code})...")
    
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(PROMPT)}"
    params = {
        "model": code,
        "width": 1024, "height": 1024,
        "nologo": "true", "enhance": "true",
        "seed": 42, "private": "true"
    }
    headers = {"Authorization": f"Bearer {API_KEY}"}

    try:
        res = requests.get(url, headers=headers, params=params, timeout=60)
        if res.status_code == 200:
            filename = f"image_{code}.jpg"
            with open(filename, 'wb') as f:
                f.write(res.content)
            print(f"   ✅ Saved: {filename}")
        else:
            print(f"   ❌ Failed: {res.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

print("\n✨ Test Finished!")
