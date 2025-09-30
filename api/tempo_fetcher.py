import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env file
load_dotenv()

USERNAME = os.getenv("EARTHDATA_USERNAME")
PASSWORD = os.getenv("EARTHDATA_PASSWORD")

if not USERNAME or not PASSWORD:
    print("❌ Please set EARTHDATA_USERNAME and EARTHDATA_PASSWORD in your .env file")
    exit(1)

# CMR Search URL
CMR_URL = "https://cmr.earthdata.nasa.gov/search/granules"

# Dataset map
PRODUCT_MAP = {
    "NO2": "TEMPO_NO2_L2",
    "O3": "TEMPO_O3_L2",
    "HCHO": "TEMPO_HCHO_L2",
}

# Download base URL
DOWNLOAD_URL = "https://data.gesdisc.earthdata.nasa.gov/data/TEMPO_L2"

def search_granules(product, date, lat, lon, buffer=0.5):
    dataset = PRODUCT_MAP[product]
    version = "V03"  # TEMPO files usually V03

    min_lon = lon - buffer
    max_lon = lon + buffer
    min_lat = lat - buffer
    max_lat = lat + buffer
    bbox = f"{min_lon},{min_lat},{max_lon},{max_lat}"

    start = datetime.strptime(date, "%Y-%m-%d")
    end = start + timedelta(days=1)

    params = {
        "short_name": dataset,
        "temporal": f"{start.strftime('%Y-%m-%dT00:00:00Z')},{end.strftime('%Y-%m-%dT00:00:00Z')}",
        "bounding_box": bbox,
        "page_size": 200,
        "page_num": 1,
    }

    headers = {"Accept": "application/json"}

    print(f"🔎 Searching {product} for {date} in {bbox}")
    r = requests.get(CMR_URL, params=params, headers=headers, auth=(USERNAME, PASSWORD))

    if r.status_code != 200:
        print("❌ CMR query failed:", r.status_code)
        print("Response snippet:", r.text[:200])
        return []

    try:
        data = r.json()
        entries = data.get("feed", {}).get("entry", [])
        return [e["title"] for e in entries]
    except Exception:
        try:
            root = ET.fromstring(r.text)
            titles = [el.text for el in root.findall(".//{*}title")]
            return titles
        except Exception as e:
            print("❌ Failed to parse response:", e)
            print("Raw response:", r.text[:200])
            return []

def download_granule(granule_name, product, date):
    dataset = PRODUCT_MAP[product]
    version = "V03"

    year = date.split("-")[0]
    url = f"{DOWNLOAD_URL}/{dataset}/{version}/{granule_name}"

    print(f"⬇️  Downloading {url}")
    r = requests.get(url, auth=(USERNAME, PASSWORD), stream=True)

    if r.status_code == 200:
        os.makedirs("downloads", exist_ok=True)
        filepath = os.path.join("downloads", granule_name)
        with open(filepath, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        print(f"✅ Saved {filepath}")
        return filepath
    else:
        print(f"❌ Download failed {r.status_code}")
        print("Response snippet:", r.text[:200])
        return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 5:
        print("Usage: python tempo_fetcher.py <PRODUCT> <LAT> <LON> <DATE: YYYY-MM-DD> [BUFFER]")
        exit(1)

    product = sys.argv[1].upper()
    lat = float(sys.argv[2])
    lon = float(sys.argv[3])
    date = sys.argv[4]
    buffer = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5

    if product not in PRODUCT_MAP:
        print(f"❌ Unsupported product: {product}")
        exit(1)

    granules = search_granules(product, date, lat, lon, buffer)

    if not granules:
        print(f"No granules found for {product} on {date}")
        exit(0)

    print({"success": True, "date": date, "granules": granules})

    # Download the first granule for now
    download_granule(granules[0], product, date)
