import requests
import os
import time
import urllib.parse

# --- משיכת המפתח הסודי ממשתני הסביבה (במקום לכתוב אותו כאן) ---
API_KEY = os.getenv("POLLINATIONS_API_KEY")

if not API_KEY:
    print("❌ Error: POLLINATIONS_API_KEY environment variable is missing!")
    exit(1)

# --- רשימת המודלים לבדיקה (מעודכנת לפי ה-HTML החדש) ---
MODELS = {
    "flux": "Flux Schnell",
    "flux-2-dev": "FLUX.2 Dev",
    "dirtberry": "Dirtberry",
    "zimage": "Z-Image Turbo",
    "imagen-4": "Google Imagen 4",
    "grok-imagine": "Grok Imagine",
    "klein": "FLUX.2 Klein 4B",
    "gptimage": "GPT Image 1 Mini",
    "klein-large": "FLUX.2 Klein 9B"
}

PROMPT = "A futuristic cyberpunk street food vendor in Tokyo, neon lights, rain, highly detailed, 8k resolution"

print("🚀 Starting Automated Model Test...")

for code, name in MODELS.items():
    print(f"\n📸 Testing {name} ({code})...")
    
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(PROMPT)}"
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
            print(f"   ❌ Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        
    # השהייה קלה בין בקשה לבקשה כדי לא להעמיס על השרת
    time.sleep(2)

print("\n✨ Test Finished!")
