import { Link } from "wouter";
import { useListCollections } from "@workspace/api-client-react";

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

export default function Dashboard() {
  const { data: collections, isLoading } = useListCollections();

  const sortedCollections = collections
    ? [...collections].sort((a, b) => {
        if (a.status !== b.status) return a.status === "locked" ? -1 : 1;
        const difference =
          new Date(a.launchDatetime).getTime() - new Date(b.launchDatetime).getTime();
        return a.status === "locked" ? difference : -difference;
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="flex min-h-[76px] items-center justify-between border-b border-border px-6 py-5 sm:px-10 lg:px-14">
        <p className="text-[11px] font-medium tracking-[0.22em] sm:text-xs">
          NYNTH LAUNCH GATE
        </p>
        <Link href="/collections/new" className="bg-foreground px-4 py-3 text-[10px] font-medium tracking-[0.16em] text-background transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:translate-y-0 sm:px-5" data-testid="button-new-collection">
          + NEW COLLECTION
        </Link>
      </header>

      <main className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">Nynth collection launch status</caption>
          <thead>
            <tr className="border-b border-border text-left text-[10px] font-normal tracking-[0.16em] text-foreground/60">
              <th className="px-6 py-4 font-normal">Collection</th>
              <th className="px-6 py-4 font-normal">Slug</th>
              <th className="px-6 py-4 font-normal">Launch Date</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 text-right font-normal">Signups</th>
              <th className="w-20 px-6 py-4 text-right font-normal">→</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Loading collections...
                </td>
              </tr>
            ) : sortedCollections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No collections found. Create one.
                </td>
              </tr>
            ) : (
              sortedCollections.map((collection) => (
                <tr
                  className="group relative border-b border-border/10 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  key={collection.id}
                  data-testid={`row-collection-${collection.id}`}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/collections/${collection.id}`} className="absolute inset-0" aria-label={`View ${collection.name}`} data-testid={`link-collection-${collection.id}`} />
                    {collection.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-foreground/70">
                    {collection.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {formatLaunchDate(collection.launchDatetime)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-widest ${
                        collection.status === "locked"
                          ? "bg-foreground text-background"
                          : "border border-border text-foreground"
                      }`}
                      data-testid={`status-${collection.status}-${collection.id}`}
                    >
                      {collection.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm tabular-nums" data-testid={`count-${collection.id}`}>
                    {collection.signupCount.toLocaleString("en-US")}
                  </td>
                  <td className="px-6 py-4 text-right text-lg text-foreground/40 transition-opacity group-hover:text-foreground">
                    <span aria-hidden="true">→</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
