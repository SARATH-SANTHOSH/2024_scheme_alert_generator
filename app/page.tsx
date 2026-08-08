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
    data = { lastChecked: null, notices: [] };
  }

  const notices: Notice[] = (data.notices || []).filter(is2024SchemeNotice);
  const lastChecked = data.lastChecked || "Never";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">KTU 2024 Scheme Live Tracker</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Latest 2024 scheme announcements from KTU
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Scraped twice daily and saved into repository JSON for a lightweight public dashboard.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-700 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={18} />
                <span className="text-sm">Last checked</span>
              </div>
              <p className="mt-2 text-lg font-medium text-slate-900">{lastChecked}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            {notices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
                <Bell className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900">No announcements available</h2>
                <p className="mt-2 text-sm text-slate-600">The tracker has not yet captured any announcements.</p>
              </div>
            ) : (
              notices.map((notice) => (
                <article key={notice.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Announcement</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">{notice.title}</h2>
                    </div>
                    <p className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{formatDate(notice.date)}</p>
                  </div>
                  {notice.description ? <p className="mt-4 text-slate-600">{notice.description}</p> : null}
                  {notice.label ? (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      <ArrowDownRight size={16} />
                      <span>{notice.label}</span>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Data source</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">KTU announcements</h2>
              <p className="mt-3 text-sm text-slate-600">The site is scraped from the KTU announcements page and saved as repository JSON.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refresh cadence</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Twice daily</h2>
              <p className="mt-3 text-sm text-slate-600">GitHub Actions runs every 01:00 and 13:00 UTC with a small randomized delay.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
