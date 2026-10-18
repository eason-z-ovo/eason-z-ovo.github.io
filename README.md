# eason-z-ovo.github.io

Static academic homepage for Fuyan Zhang, published with GitHub Pages.

The site has no build step or runtime dependencies. Serve the repository root with any static server, or open `index.html` directly. GitHub Pages can publish the same files.

- `index.html`: biography, research direction, all seven publication records and BibTeX, education, experience, and personal interests.
- `styles.css`: responsive editorial layout with a paper / forest-green palette.
- `main.js`: publication filters, citation toggles, and an optional motion illustration with play/pause and timeline controls.
- `assets/`: portrait, publication figures, institution logos, and personal marks. The original logo is retained; `fuyan-mark.svg` adapts it to the lighter palette.
- `uploads/`: downloadable documents, including the existing CV.

Local preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8765`. No install or build is required.

The biography and current-direction section reflect the October 16, 2026 research memo: reference-guided motion composition, preserving specified rhythm and form while allowing whole-body adaptation. These are research interests, separate from published results. The interactive motion sketch is an illustrative animation, not output from a research model.

All publications and citations remain visible when JavaScript is unavailable. Animation starts paused and can be scrubbed with a keyboard; it stops when out of view. System font fallbacks keep the site readable if Google Fonts is unavailable. Print styles include all publications.
