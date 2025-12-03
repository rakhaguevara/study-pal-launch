# PWA Icons

This folder contains the Progressive Web App (PWA) icons for StudyPal.

## Required Icons

The PWA requires the following icon files:

- `icon-192.png` - 192x192 pixels (for Android home screen)
- `icon-512.png` - 512x512 pixels (for splash screen and high-res displays)

## Current Status

Currently, placeholder SVG files are provided:
- `icon-192.svg` - Placeholder SVG (192x192)
- `icon-512.svg` - Placeholder SVG (512x512)

## How to Add Real Icons

1. **Create or obtain PNG icons:**
   - Design icons with StudyPal branding
   - Ensure icons are square (1:1 aspect ratio)
   - Recommended: Use a design tool like Figma, Adobe Illustrator, or Canva

2. **Convert to PNG:**
   - Export as PNG with exact dimensions:
     - `icon-192.png` - 192x192 pixels
     - `icon-512.png` - 512x512 pixels
   - Ensure transparent background or solid color background matching brand

3. **Place files in this directory:**
   - Replace the SVG placeholders with PNG files
   - Keep the exact filenames: `icon-192.png` and `icon-512.png`

4. **Test the icons:**
   - Run `npm run build`
   - Run `npm run preview`
   - Check in Chrome DevTools → Application → Manifest
   - Verify icons appear correctly

## Icon Design Guidelines

- **Size:** Exactly 192x192 and 512x512 pixels
- **Format:** PNG with transparency or solid background
- **Content:** StudyPal logo or branded icon
- **Style:** Should work well on both light and dark backgrounds
- **Padding:** Leave some padding around the icon (don't fill entire canvas)

## Quick Conversion (if you have SVG)

If you have an SVG logo, you can convert it using:

```bash
# Using ImageMagick (if installed)
convert -background none -resize 192x192 logo.svg icon-192.png
convert -background none -resize 512x512 logo.svg icon-512.png

# Or use online tools like:
# - https://cloudconvert.com/svg-to-png
# - https://convertio.co/svg-png/
```

