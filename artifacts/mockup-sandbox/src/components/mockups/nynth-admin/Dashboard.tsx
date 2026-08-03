import "./_group.css";

type Collection = {
  id: string;
  name: string;
  slug: string;
  launchDatetime: string;
  status: "locked" | "live";
  signupCount: number;
};

const collections: Collection[] = [
  { id: "1", name: "SS26 — The Void", slug: "ss26-the-void", launchDatetime: "2026-09-15T18:00:00Z", status: "locked", signupCount: 1204 },
  { id: "2", name: "FW26 — Obsidian", slug: "fw26-obsidian", launchDatetime: "2026-11-01T18:00:00Z", status: "locked", signupCount: 873 },
  { id: "3", name: "SS25 — Fracture", slug: "ss25-fracture", launchDatetime: "2025-04-10T18:00:00Z", status: "live", signupCount: 4411 },
  { id: "4", name: "FW25 — Null", slug: "fw25-null", launchDatetime: "2025-10-22T18:00:00Z", status: "live", signupCount: 3089 },
  { id: "5", name: "Resort25 — Drift", slug: "resort25-drift", launchDatetime: "2025-02-05T18:00:00Z", status: "live", signupCount: 1756 },
];

const sortedCollections = [...collections].sort((a, b) => {
  if (a.status !== b.status) return a.status === "locked" ? -1 : 1;
  const difference =
    new Date(a.launchDatetime).getTime() - new Date(b.launchDatetime).getTime();
  return a.status === "locked" ? difference : -difference;
});

function formatLaunchDate(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("month")} ${get("day")}, ${get("year")} — ${get("hour")}:${get("minute")} ${get("dayPeriod")} UTC`;
}

export function Dashboard() {
  return (
    <div className="min-h-screen bg-white text-black font-['Space_Grotesk']">
      <header className="flex min-h-[76px] items-center justify-between border-b border-black px-6 py-5 sm:px-10 lg:px-14">
        <p className="text-[11px] font-medium tracking-[0.22em] sm:text-xs">
          NYNTH LAUNCH GATE
        </p>
        <button
          className="bg-black px-4 py-3 text-[10px] font-medium tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:translate-y-0 sm:px-5"
          type="button"
        >
          + NEW COLLECTION
        </button>
      </header>

      <main className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">Nynth collection launch status</caption>
          <thead>
            <tr className="border-b border-black text-left text-[10px] font-normal tracking-[0.16em] text-black/60">
              <th className="px-6 py-4 font-normal">Collection</th>
              <th className="px-6 py-4 font-normal">Slug</th>
              <th className="px-6 py-4 font-normal">Launch Date</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 text-right font-normal">Signups</th>
              <th className="w-20 px-6 py-4 text-right font-normal">→</th>
            </tr>
          </thead>
          <tbody>
            {sortedCollections.map((collection) => (
              <tr
                className="group cursor-pointer border-b border-black/10 transition-colors hover:bg-black/5"
                key={collection.id}
              >
                <td className="px-6 py-4 text-sm font-medium">
                  {collection.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-black/70">
                  {collection.slug}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {formatLaunchDate(collection.launchDatetime)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-widest ${
                      collection.status === "locked"
                        ? "bg-black text-white"
                        : "border border-black text-black"
                    }`}
                  >
                    {collection.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm tabular-nums">
                  {collection.signupCount.toLocaleString("en-US")}
                </td>
                <td className="px-6 py-4 text-right text-lg text-black/40 transition-opacity group-hover:text-black">
                  <span>→</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Dashboard;