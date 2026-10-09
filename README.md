# Part Two Puzzle Experience

This project is a romantic interactive mystery page built as a static web app.

## Run locally

Open `index.html` in a browser, or serve the folder with a simple local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Features included

- Romantic midnight-blue opening screen with animated stars
- 4-digit passcode protected with a visual keypad and keyboard support
- 3x3 sliding photo puzzle using the first uploaded image
- 4x4 picture puzzle using the second uploaded image
- Move counter, restart, preview, hints, and completion states
- Final reveal showing "EIGHT DAYS" to save for the next part

## Notes

The app uses the uploaded images from the browser as the image source for each puzzle. If no image is selected, it falls back to elegant placeholder photographs so the experience still works during development.

## Deploy

This can be published via GitHub Pages or any static host.

