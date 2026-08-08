# KTU Announcement Tracker

This repository tracks APJ Abdul Kalam Technological University announcements using a simple Next.js dashboard and a Python + Playwright scraper.

## Contents

- `app/` — Next.js 14 frontend app
- `scraper.py` — Playwright scraper that renders the KTU announcements page and writes `data/notifications.json`
- `.github/workflows/scrape.yml` — GitHub Actions cron job that refreshes announcement data twice daily
- `data/notifications.json` — persisted scraped announcement data

## Local setup

### Python / scraper

1. Create and activate the virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install Playwright:
   ```bash
   python -m pip install --upgrade pip
   python -m pip install playwright
   python -m playwright install chromium
   ```

3. Run the scraper:
   ```bash
   python scraper.py
   ```

4. The scraper writes announcement data to:
   - `data/notifications.json`- The frontend displays only notices matching the 2024 scheme.
> Note: always run the scraper from the repository root using the venv Python interpreter.

## Frontend

### Install Node dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## GitHub Actions

The workflow `.github/workflows/scrape.yml` does the following:

- checks out the repo
- sets up Python 3.12
- installs Playwright and Chromium
- runs `python scraper.py`
- commits and pushes `data/notifications.json` if it changed

## Notes

- The KTU announcements page is client-side rendered and requires browser automation to extract the notice cards.
- The scraper uses `playwright.sync_api` and launches Chromium headless.
- `data/notifications.json` includes a `lastChecked` timestamp, the source URL, and the scraped notice list.
