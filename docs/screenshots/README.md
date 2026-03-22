# Website screenshots

These PNGs show the Nutrition Analyzer UI (local dev server, `npm start` in `frontend`).

| File | Page |
|------|------|
| `home.png` | Landing page (full page) |
| `login.png` | Sign-in |
| `register.png` | Create account |

Regenerate with Playwright, for example:

`npx playwright screenshot http://localhost:3000/ ./docs/screenshots/home.png --full-page --wait-for-timeout 10000`
