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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-500 p-8 text-white shadow-xl shadow-sky-200/40 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-100/90">KTU 2024 Scheme Live Tracker</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Latest 2024 scheme announcements from KTU</h1>
              <p className="mt-4 max-w-2xl text-base text-slate-100/90 sm:text-lg">
                Scraped twice daily and saved into repository JSON for a lightweight public dashboard with quick access to the latest 2024 scheme notifications.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-slate-900/10 transition hover:bg-slate-100"
                >
                  <ArrowDownRight size={18} />
                  View source announcements
                </a>
                <div className="rounded-full bg-white/10 px-4 py-3 text-sm text-cyan-100">
                  Updated at {lastChecked}
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/10 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">Refresh cadence</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Twice daily</p>
                </div>
                <div className="rounded-3xl bg-white/20 px-3 py-2 text-sm text-white">GitHub Actions</div>
              </div>
              <div className="mt-5 space-y-4 text-sm text-cyan-100/85">
                <p>Updates are fetched every 01:00 and 13:00 UTC.</p>
                <p>Only 2024 scheme announcements are displayed here.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6">
            {notices.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <Bell className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h2 className="text-2xl font-semibold text-slate-900">No 2024 scheme announcements found</h2>
                <p className="mt-3 text-sm text-slate-600">This tracker is waiting for the next scrape or no matching announcements were found.</p>
              </div>
            ) : (
              notices.map((notice) => (
                <article key={notice.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Announcement</p>
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-2xl font-semibold leading-tight text-slate-900 transition hover:text-sky-600"
                      >
                        {notice.title}
                      </a>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                      {formatDate(notice.date)}
                    </span>
                  </div>

                  {notice.description ? <p className="mt-5 text-slate-600">{notice.description}</p> : null}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {notice.label ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                        <ArrowDownRight size={16} />
                        {notice.label}
                      </span>
                    ) : null}
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      View on KTU
                    </a>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Data source</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">KTU announcements</h2>
              <p className="mt-3 text-sm text-slate-600">This dashboard reads the scraped repository JSON and links back to the original KTU announcements page.</p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open KTU source
              </a>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refresh cadence</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Twice daily</h2>
              <p className="mt-3 text-sm text-slate-600">GitHub Actions runs every 01:00 and 13:00 UTC to keep announcements fresh.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
