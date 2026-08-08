import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { ArrowDownRight, Bell, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "KTU 2024 Scheme Live Tracker",
  description: "Live KTU announcement dashboard and update status.",
};

const dataPath = path.join(process.cwd(), "data", "notifications.json");
interface Notice {
  id: string;
  title: string;
  date?: string | null;
  description?: string | null;
  label?: string | null;
  link?: string | null;
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Unknown date";
  }
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    return dateString;
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function is2024SchemeNotice(notice: Notice) {
  return notice.title.toLowerCase().includes("2024 scheme");
}

export default function HomePage() {
  let data;
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    data = JSON.parse(raw);
  } catch {
    data = { lastChecked: null, sourceUrl: "https://ktu.edu.in/menu/announcements", notices: [] };
  }

  const notices: Notice[] = (data.notices || []).filter(is2024SchemeNotice);
  const lastChecked = data.lastChecked || "Never";
  const sourceUrl = data.sourceUrl || "https://ktu.edu.in/menu/announcements";

  return (
    <main className="tracker-main">
      <div className="tracker-container">
        <div className="tracker-hero">
          <div className="tracker-hero-grid">
            <div className="tracker-hero-copy">
              <p className="tracker-hero-label">KTU 2024 Scheme Live Tracker</p>
              <h1 className="tracker-hero-title">Latest 2024 scheme announcements from KTU</h1>
              <p className="tracker-hero-description">
                Scraped twice daily and saved into repository JSON for a lightweight public dashboard with quick access to the latest 2024 scheme notifications.
              </p>
              <div className="tracker-action-group">
                <a href={sourceUrl} target="_blank" rel="noreferrer" className="tracker-button">
                  <ArrowDownRight size={18} />
                  View source announcements
                </a>
                <div className="tracker-pill">Updated at {lastChecked}</div>
              </div>
            </div>

            <div className="tracker-hero-card">
              <div className="tracker-hero-card-inner">
                <div>
                  <p className="tracker-small-label">Refresh cadence</p>
                  <p className="tracker-hero-card-title">Twice daily</p>
                </div>
                <div className="tracker-status-pill">GitHub Actions</div>
              </div>
              <div className="tracker-hero-note">
                <p>Updates are fetched every 01:00 and 13:00 UTC.</p>
                <p>Only 2024 scheme announcements are displayed here.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tracker-layout">
          <section className="tracker-section">
            {notices.length === 0 ? (
              <div className="tracker-empty-state">
                <Bell className="tracker-empty-icon" />
                <h2>No 2024 scheme announcements found</h2>
                <p>This tracker is waiting for the next scrape or no matching announcements were found.</p>
              </div>
            ) : (
              notices.map((notice) => (
                <article key={notice.id} className="tracker-card">
                  <div className="tracker-card-header">
                    <div>
                      <p className="tracker-small-label">Announcement</p>
                      <a href={sourceUrl} target="_blank" rel="noreferrer" className="tracker-card-title">
                        {notice.title}
                      </a>
                    </div>
                    <span className="tracker-date-pill">{formatDate(notice.date)}</span>
                  </div>

                  {notice.description ? <p className="tracker-card-description">{notice.description}</p> : null}

                  <div className="tracker-card-footer">
                    {notice.label ? (
                      <span className="tracker-badge">
                        <ArrowDownRight size={16} />
                        {notice.label}
                      </span>
                    ) : null}
                    <a href={sourceUrl} target="_blank" rel="noreferrer" className="tracker-button">
                      View on KTU
                    </a>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="tracker-aside">
            <div className="tracker-box">
              <p className="tracker-small-label">Data source</p>
              <h2 className="tracker-box-title">KTU announcements</h2>
              <p className="tracker-box-text">This dashboard reads the scraped repository JSON and links back to the original KTU announcements page.</p>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="tracker-button tracker-button-block">
                Open KTU source
              </a>
            </div>
            <div className="tracker-box">
              <p className="tracker-small-label">Refresh cadence</p>
              <h2 className="tracker-box-title">Twice daily</h2>
              <p className="tracker-box-text">GitHub Actions runs every 01:00 and 13:00 UTC to keep announcements fresh.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
