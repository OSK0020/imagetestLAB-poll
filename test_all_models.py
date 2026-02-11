import requests
import random
import os
import time

# --- המפתח החדש שלך ---
API_KEY = "sk_4syyCnDbIaq77tGp1aEBptIEr6vz4yCA"

# --- הפרומפט לבדיקה ---
# בחרתי משהו מורכב כדי לראות את ההבדלים בפרטים
PROMPT = "A futuristic cyberpunk street food vendor in Tokyo, neon lights, rain, highly detailed, photorealistic, 8k resolution, cinematic lighting"

# --- רשימת המודלים לבדיקה ---
MODELS = {
    "flux": "Flux Schnell (Fast & Good)",
    "zimage": "Z-Image Turbo",
    "imagen-4": "Google Imagen 4 (Alpha - Best Photorealism)",
    "klein": "FLUX.2 Klein 4B",
    "klein-large": "FLUX.2 Klein 9B (High Detail)",
    "gptimage": "GPT Image 1 Mini"
}

def test_model(model_code, model_name):
    print(f"\n🧪 Testing: {model_name} ({model_code})...")
    
    seed = random.randint(1, 999999)
    safe_prompt = requests.utils.quote(PROMPT)
    
    # כתובת נקייה
    url = f"https://image.pollinations.ai/prompt/{safe_prompt}"
    
    # הפרמטרים
    params = {
        "model": model_code,
        "width": 1024,
        "height": 1024,
        "nologo": "true",
        "enhance": "true",
        "seed": seed,
        "private": "true"
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "User-Agent": "Mozilla/5.0 (Test Script)"
    }

    try:
        start_time = time.time()
        response = requests.get(url, headers=headers, params=params, timeout=120)
        elapsed_time = round(time.time() - start_time, 2)
        
        if response.status_code == 200:
            filename = f"check_{model_code}.jpg"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            size_kb = round(os.path.getsize(filename) / 1024, 1)
            print(f"   ✅ Success! Saved as: {filename}")
            print(f"   ⏱️ Time: {elapsed_time}s | 💾 Size: {size_kb}KB")
        else:
            print(f"   ❌ Failed: Status {response.status_code}")
            print(f"   ⚠️ Reason: {response.text[:100]}")

    except Exception as e:
        print(f"   ❌ Error: {e}")

# --- הרצת הבדיקה ---
print(f"🚀 Starting Grand Model Comparison...")
print(f"🔑 Key ends with: ...{API_KEY[-4:]}")

for code, name in MODELS.items():
    test_model(code, name)

print("\n✨ Done! Open the files in the file explorer to compare.")
