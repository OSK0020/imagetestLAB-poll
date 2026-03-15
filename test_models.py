import os
import sys
import time
import urllib.parse
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

sys.stdout.reconfigure(encoding='utf-8')

# --- Configuration & Auth Setup ---
API_KEY = os.getenv("POLLINATIONS_API_KEY")

if not API_KEY:
    print("❌ Error: POLLINATIONS_API_KEY environment variable is missing!")
    exit(1)

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

# --- Setup Robust Session ---
def create_robust_session() -> requests.Session:
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def main():
    print("🚀 Starting Automated Model Test with Robust Handling...")
    session = create_robust_session()

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
            res = session.get(url, headers=headers, params=params, timeout=60)
            if res.status_code == 200:
                filename = f"image_{code}.jpg"
                try:
                    with open(filename, 'wb') as f:
                        f.write(res.content)
                    print(f"   ✅ Saved: {filename}")
                except IOError as io_err:
                    print(f"   ❌ File write error: {io_err}")
            else:
                print(f"   ❌ Failed: HTTP {res.status_code} - {res.text}")
        except requests.exceptions.RequestException as req_err:
            print(f"   ❌ Network error: {req_err}")
        except Exception as e:
            print(f"   ❌ Unexpected Error: {e}")
            
        time.sleep(3) # Throttle to prevent server exhaustion

    print("\n✨ Test Finished!")

if __name__ == "__main__":
    main()
