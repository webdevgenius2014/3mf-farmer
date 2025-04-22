# 3MF G-code Modifier

## Overview
A single-page, client-side web application to process 3MF files locally, multiply G-code instructions, and download the modified file.

## Deployment
1. Place `index.html` in a web server directory or open directly in a browser.
2. For local testing, run `python -m http.server` and access `http://localhost:8000`.
3. Ensure an internet connection for the JSZip CDN (or host JSZip locally for offline use).

## Testing
1. Use a sample 3MF file (1–10 MB) containing a `Metadata/plate_*.gcode` file.
2. Drag-and-drop or select the file, set loop repeats (e.g., 5), and specify an output filename.
3. Click "Process & Download" to generate the modified 3MF.
4. Test on Chrome, Firefox, and Edge.
5. Verify output file size (up to 150 MB) and G-code multiplication.

## Dependencies
- JSZip (loaded via CDN: https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js)

## Browser Support
- Chrome, Firefox, Edge (latest versions).