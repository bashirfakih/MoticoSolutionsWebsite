# PWA Icons

This folder contains icons for the Progressive Web App.

## Generating PNG Icons

To generate PNG icons from the SVG, you can use one of these methods:

### Option 1: Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload the `icon.svg` file
3. Download and extract the generated icons

### Option 2: Using Sharp (Node.js)
```bash
npm install sharp
node scripts/generate-icons.js
```

### Option 3: Using ImageMagick
```bash
# Install ImageMagick first
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

## Required Sizes
- 72x72 - Android
- 96x96 - Android
- 128x128 - Chrome Web Store
- 144x144 - Windows tiles
- 152x152 - iOS
- 192x192 - Android/Chrome
- 384x384 - Android splash
- 512x512 - Android splash/maskable
