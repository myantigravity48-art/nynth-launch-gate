import { useState } from "react";
import "./_group.css";

type Collection = {
  id: string;
  name: string;
  slug: string;
  launchDatetime: string;
  status: "locked" | "live";
};

type Signup = {
  id: string;
  collectionId: string;
  email: string;
  unlocked: boolean;
  createdAt: string;
};

const collection: Collection = {
  id: "1",
  name: "SS26 — The Void",
  slug: "ss26-the-void",
  launchDatetime: "2026-09-15T18:00:00Z",
  status: "locked",
};

const initialSignups: Signup[] = [
  { id: "s1", collectionId: "1", email: "aoki@domain.com", unlocked: true, createdAt: "2026-07-01T10:22:00Z" },
  { id: "s2", collectionId: "1", email: "maris@domain.com", unlocked: true, createdAt: "2026-07-02T14:08:00Z" },
  { id: "s3", collectionId: "1", email: "chen@domain.com", unlocked: false, createdAt: "2026-07-03T09:45:00Z" },
  { id: "s4", collectionId: "1", email: "nneka@domain.com", unlocked: false, createdAt: "2026-07-04T16:30:00Z" },
  { id: "s5", collectionId: "1", email: "yusuf@domain.com", unlocked: false, createdAt: "2026-07-05T11:00:00Z" },
  { id: "s6", collectionId: "1", email: "petra@domain.com", unlocked: false, createdAt: "2026-07-06T08:15:00Z" },
  { id: "s7", collectionId: "1", email: "roux@domain.com", unlocked: false, createdAt: "2026-07-07T13:50:00Z" },
  { id: "s8", collectionId: "1", email: "sienna@domain.com", unlocked: false, createdAt: "2026-07-08T17:20:00Z" },
  { id: "s9", collectionId: "1", email: "daisuke@domain.com", unlocked: false, createdAt: "2026-07-09T10:05:00Z" },
];

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

function formatSignupDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function CollectionDetail() {
  const [signups, setSignups] = useState(initialSignups);
  const [sent, setSent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);

  function handleSend() {
    setSent(true);
    setShowConfirmation(true);
    setSignups((previous) => previous.map((signup) => ({ ...signup, unlocked: true })));
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Space_Grotesk']">
      <header className="border-b border-black px-6 py-6 sm:px-10 sm:py-8 lg:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              className="mb-7 cursor-pointer text-left text-[11px] font-medium tracking-[0.08em] text-black/50 transition-colors hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4"
              type="button"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-medium uppercase leading-none tracking-[-0.055em] sm:text-5xl">
              {collection.name}
            </h1>
            <div className="mt-5 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-5">
              <span className="font-mono text-black/60">{collection.slug}</span>
              <span className="hidden text-black/30 sm:inline" aria-hidden="true">/</span>
              <span>{formatLaunchDate(collection.launchDatetime)}</span>
              <span
                className={`inline-flex w-fit items-center px-2 py-1 text-[10px] font-medium tracking-[0.16em] ${
                  collection.status === "locked" ? "bg-black text-white" : "border border-black"
                }`}
              >
                {collection.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 lg:flex-col lg:items-end lg:gap-1">
            <span className="font-mono text-5xl font-medium leading-none tracking-[-0.08em] sm:text-6xl">
              {signups.length}
            </span>
            <span className="pb-1 text-[11px] font-medium tracking-[0.2em] text-black/60 sm:text-xs lg:pb-0">
              SIGNUPS
            </span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
        <section className="mx-auto max-w-[1100px]" aria-label="Unlock controls">
          {showConfirmation && sent && (
            <div className="mb-5 flex items-center justify-between gap-4 bg-black px-5 py-4 text-sm font-medium text-white">
              <span>✓ Unlock emails sent to {signups.length} signups.</span>
              <button
                className="cursor-pointer p-1 text-lg leading-none text-white/60 transition-colors hover:text-white focus:outline-none focus:ring-1 focus:ring-white"
                type="button"
                aria-label="Dismiss confirmation"
                onClick={() => setShowConfirmation(false)}
              >
                ×
              </button>
            </div>
          )}
          <button
            className="w-full cursor-pointer bg-black px-8 py-5 text-lg font-medium tracking-[0.12em] text-white transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-xl"
            type="button"
            disabled={sent}
            onClick={handleSend}
          >
            {sent ? "EMAILS SENT" : "SEND UNLOCK EMAILS"}
          </button>
        </section>

        <section className="mx-auto mt-12 max-w-[1100px] sm:mt-16" aria-label="Collection signups">
          <div className="mb-4 flex items-baseline justify-between border-b border-black pb-3">
            <h2 className="text-xs font-medium tracking-[0.18em]">SIGNUP LEDGER</h2>
            <span className="font-mono text-xs text-black/50">{signups.length.toString().padStart(2, "0")} RECORDS</span>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <caption className="sr-only">Signups for {collection.name}</caption>
              <thead>
                <tr className="border-b border-black text-left text-[10px] tracking-[0.16em] text-black/60">
                  <th className="px-6 py-4 font-normal">Email</th>
                  <th className="px-6 py-4 font-normal">Signed Up</th>
                  <th className="px-6 py-4 font-normal">Unlocked</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((signup) => (
                  <tr className="border-b border-black/10 transition-colors hover:bg-black/5" key={signup.id}>
                    <td className="px-6 py-3 font-mono text-xs sm:text-sm">{signup.email}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm">{formatSignupDate(signup.createdAt)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-[10px] font-medium tracking-[0.14em] ${
                          signup.unlocked ? "bg-black text-white" : "border border-black text-black"
                        }`}
                      >
                        {signup.unlocked ? "UNLOCKED" : "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CollectionDetail;