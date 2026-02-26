#!/usr/bin/env python3
"""
Product Image Downloader & Data Saver
Downloads product images and saves data to: C:/DBF Nexus/DBF Digital/MoticoSolutionsWebsite/temp
"""

import os
import json
import requests
from pathlib import Path
from urllib.parse import unquote

DEST = r"C:\DBF Nexus\DBF Digital\MoticoSolutionsWebsite\temp"

PRODUCTS = [
    {
        "id": 1, "slug": "poly-ptx-802-ht-linear-grinder",
        "title": "POLY-PTX 802 HT linear grinder",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/52/60/59/POLY-PTX802HTmitFeinstaub-Schutz.jpg",
            "https://www.eisenblaetter.de/media/image/11/20/9d/POLY-PTX802HTSatiniermaschineSet.jpg",
            "https://www.eisenblaetter.de/media/image/a9/a4/90/POLY-PTX802HTSatiniermaschineSeite.jpg",
            "https://www.eisenblaetter.de/media/image/74/b1/b3/POLY-PTX802HT3DModell.jpg",
            "https://www.eisenblaetter.de/media/image/25/22/f5/POLY-PTX802HTLngsschliff.jpg",
            "https://www.eisenblaetter.de/media/image/a6/a6/b2/POLY-PTX802HTSatinieren.jpg",
            "https://www.eisenblaetter.de/media/image/2b/82/02/POLY-PTX802HTmitVLIES-TOP-Rad.jpg",
            "https://www.eisenblaetter.de/media/image/3e/86/57/POLY-PTX802HTmitExpansionwalze.jpg",
            "https://www.eisenblaetter.de/media/image/d1/1d/8e/POLY-PTX802HTperfekterSpiegelglanz.jpg",
            "https://www.eisenblaetter.de/media/image/75/38/ef/POLY-PTX802HTVorteile.jpg"
        ]
    }
]

os.makedirs(DEST, exist_ok=True)
print(f"Destination: {DEST}")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

for product in PRODUCTS:
    print(f"\n=== {product['title']} ===")
    for i, url in enumerate(product['images'], 1):
        ext = url.split('?')[0].split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'webp', 'gif']:
            ext = 'jpg'
        filename = f"{product['slug']}_{i:02d}.{ext}"
        filepath = os.path.join(DEST, filename)
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            resp.raise_for_status()
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            print(f"  OK: {filename}")
        except Exception as e:
            print(f"  FAIL: {filename} - {e}")

print("\nDone!")
