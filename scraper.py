#!/usr/bin/env python3
import json
import random
import sys
import time
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Optional

from playwright.sync_api import Playwright, sync_playwright

SOURCE_URL = "https://ktu.edu.in/menu/announcements"
OUTPUT_PATH = Path("data/notifications.json")
MAX_JITTER_SECONDS = 900
WAIT_SELECTOR = "h6.f-w-bold"


def build_notice_id(title: str, date: Optional[str]) -> str:
    normalized = f"{title}|{date or ''}"
    return sha256(normalized.encode("utf-8")).hexdigest()[:12]


def normalize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = value.strip()
    return text if text else None


def extract_notices(page) -> list[dict[str, Optional[str]]]:
    page.wait_for_selector(WAIT_SELECTOR, timeout=45000)
    return page.evaluate(
        """
        () => {
          const elements = Array.from(document.querySelectorAll('h6.f-w-bold'));
          const notices = [];
          for (const titleEl of elements) {
            const card = titleEl.closest('div[class*="shadow"]') || titleEl.closest('div.card') || titleEl.parentElement;
            if (!card) continue;
            const title = titleEl.innerText.trim();
            if (!title) continue;
            const dateEl = card.querySelector('div.font-14.text-theme.h6.m-t-10.f-w-bold') ||
                           card.querySelector('div.font-14.text-theme') ||
                           card.querySelector('p strong') ||
                           card.querySelector('span');
            const date = dateEl?.innerText.trim() || null;
            const paragraphEls = Array.from(card.querySelectorAll('p'));
            const descriptionEl = paragraphEls.find(p => !p.querySelector('strong')) || paragraphEls[0];
            const description = descriptionEl?.innerText.trim() || null;
            const buttonEl = card.querySelector('button, a[href]');
            const label = buttonEl?.innerText.trim() || null;
            notices.push({
              title,
              date,
              description,
              label,
            });
          }
          return notices;
        }
        """
    )


def load_existing_data() -> dict:
    if OUTPUT_PATH.exists():
        try:
            return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def write_output(notices: list[dict[str, Optional[str]]]) -> None:
    output = {
        "lastChecked": datetime.now(timezone.utc).isoformat(),
        "sourceUrl": SOURCE_URL,
        "notices": notices,
    }
    OUTPUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_scraper(playwright: Playwright) -> list[dict[str, Optional[str]]]:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent=
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    )
    page = context.new_page()
    page.goto(SOURCE_URL, timeout=120000, wait_until="domcontentloaded")
    time.sleep(2)
    notices = extract_notices(page)
    browser.close()
    return notices


def main() -> int:
    jitter = random.randint(0, MAX_JITTER_SECONDS)
    if jitter:
        print(f"Waiting {jitter} seconds to randomize scrape window...")
        time.sleep(jitter)

    try:
        with sync_playwright() as playwright:
            raw_notices = run_scraper(playwright)
    except Exception as error:
        print(f"Scrape failed: {error}")
        return 1

    seen = set()
    notices = []
    for item in raw_notices:
        title = normalize_text(item.get("title"))
        if not title:
            continue
        date = normalize_text(item.get("date"))
        description = normalize_text(item.get("description"))
        label = normalize_text(item.get("label"))
        notice_id = build_notice_id(title, date)
        if notice_id in seen:
            continue
        seen.add(notice_id)
        notices.append(
            {
                "id": notice_id,
                "title": title,
                "date": date,
                "description": description,
                "label": label,
            }
        )

    existing_data = load_existing_data()
    existing_notices = existing_data.get("notices", []) or []
    if notices != existing_notices:
        print(f"Found {len(notices)} notices; writing updated JSON.")
    else:
        print(f"Found {len(notices)} notices; no content change detected.")

    write_output(notices)
    print(f"Wrote {OUTPUT_PATH}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
