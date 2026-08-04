import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetCollection,
  useListSignups,
  useSendUnlockEmails,
  getListSignupsQueryKey,
  getGetCollectionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

export default function CollectionDetail() {
  const params = useParams();
  const slug = params.slug!;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: collection, isLoading: isCollectionLoading } = useGetCollection(slug, {
    query: { enabled: !!slug, queryKey: getGetCollectionQueryKey(slug) }
  });
  
  const { data: signups = [], isLoading: isSignupsLoading } = useListSignups(slug, {
    query: { enabled: !!slug, queryKey: getListSignupsQueryKey(slug) }
  });
  
  const sendUnlockEmails = useSendUnlockEmails();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const hasPendingSignups = signups.some(s => !s.unlocked);
  // We disable the button if no pending signups, or if we just sent them and waiting for a refetch
  // In the real mockup, they disabled it if `sent` is true, but since we rely on server data, 
  // it will naturally disable when all signups are unlocked.
  const isSendDisabled = sendUnlockEmails.isPending || !hasPendingSignups || isSignupsLoading;

  function handleSend() {
    sendUnlockEmails.mutate(
      { slug },
      {
        onSuccess: (result) => {
          setSentCount(result.sent);
          setShowConfirmation(true);
          // Invalidate to fetch fresh signups
          queryClient.invalidateQueries({ queryKey: getListSignupsQueryKey(slug) });
          queryClient.invalidateQueries({ queryKey: getGetCollectionQueryKey(slug) });
        },
        onError: (err) => {
          toast({
            title: "Error sending emails",
            description: (err as { data?: { error?: string } }).data?.error || "An unexpected error occurred",
            variant: "destructive",
          });
        }
      }
    );
  }

  if (isCollectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <p className="text-sm font-medium tracking-widest text-muted-foreground">LOADING COLLECTION...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans gap-4">
        <p className="text-sm font-medium tracking-widest text-muted-foreground">COLLECTION NOT FOUND</p>
        <Link href="/" className="text-xs border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
          RETURN TO DASHBOARD
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border px-6 py-6 sm:px-10 sm:py-8 lg:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="mb-7 block w-fit cursor-pointer text-left text-[11px] font-medium tracking-[0.08em] text-foreground/50 transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4"
              data-testid="link-back-dashboard"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-medium uppercase leading-none tracking-[-0.055em] sm:text-5xl" data-testid="text-collection-name">
              {collection.name}
            </h1>
            <div className="mt-5 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-5">
              <span className="font-mono text-foreground/60" data-testid="text-collection-slug">{collection.id}</span>
              <span className="hidden text-foreground/30 sm:inline" aria-hidden="true">/</span>
              <span data-testid="text-launch-date">{formatLaunchDate(collection.launchDatetime)}</span>
              <span
                className={`inline-flex w-fit items-center px-2 py-1 text-[10px] font-medium tracking-[0.16em] ${
                  collection.status === "locked" ? "bg-foreground text-background" : "border border-border"
                }`}
                data-testid={`badge-status-${collection.status}`}
              >
                {collection.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 lg:flex-col lg:items-end lg:gap-1">
            <span className="font-mono text-5xl font-medium leading-none tracking-[-0.08em] sm:text-6xl" data-testid="text-signup-count">
              {signups.length}
            </span>
            <span className="pb-1 text-[11px] font-medium tracking-[0.2em] text-foreground/60 sm:text-xs lg:pb-0">
              SIGNUPS
            </span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
        <section className="mx-auto max-w-[1100px]" aria-label="Unlock controls">
          {showConfirmation && (
            <div className="mb-5 flex items-center justify-between gap-4 bg-foreground px-5 py-4 text-sm font-medium text-background" data-testid="banner-confirmation">
              <span data-testid="text-sent-count">✓ Unlock emails sent to {sentCount} signups.</span>
              <button
                className="cursor-pointer p-1 text-lg leading-none text-background/60 transition-colors hover:text-background focus:outline-none focus:ring-1 focus:ring-background"
                type="button"
                aria-label="Dismiss confirmation"
                onClick={() => setShowConfirmation(false)}
                data-testid="button-dismiss-confirmation"
              >
                ×
              </button>
            </div>
          )}
          <button
            className="w-full cursor-pointer bg-foreground px-8 py-5 text-lg font-medium tracking-[0.12em] text-background transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-xl"
            type="button"
            disabled={isSendDisabled}
            onClick={handleSend}
            data-testid="button-send-unlock"
          >
            {sendUnlockEmails.isPending ? "SENDING EMAILS..." : !hasPendingSignups ? "ALL EMAILS SENT" : "SEND UNLOCK EMAILS"}
          </button>
        </section>

        <section className="mx-auto mt-12 max-w-[1100px] sm:mt-16" aria-label="Collection signups">
          <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-xs font-medium tracking-[0.18em]">SIGNUP LEDGER</h2>
            <span className="font-mono text-xs text-foreground/50">{signups.length.toString().padStart(2, "0")} RECORDS</span>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <caption className="sr-only">Signups for {collection.name}</caption>
              <thead>
                <tr className="border-b border-border text-left text-[10px] tracking-[0.16em] text-foreground/60">
                  <th className="px-6 py-4 font-normal">Email</th>
                  <th className="px-6 py-4 font-normal">Signed Up</th>
                  <th className="px-6 py-4 font-normal">Unlocked</th>
                </tr>
              </thead>
              <tbody>
                {isSignupsLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Loading signups...
                    </td>
                  </tr>
                ) : signups.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No signups yet.
                    </td>
                  </tr>
                ) : (
                  signups.map((signup) => (
                    <tr className="border-b border-border/10 transition-colors hover:bg-black/5 dark:hover:bg-white/5" key={signup.id} data-testid={`row-signup-${signup.id}`}>
                      <td className="px-6 py-3 font-mono text-xs sm:text-sm">{signup.email}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm">{formatSignupDate(signup.createdAt)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-medium tracking-[0.14em] ${
                            signup.unlocked ? "bg-foreground text-background" : "border border-border text-foreground"
                          }`}
                          data-testid={`badge-unlocked-${signup.unlocked}`}
                        >
                          {signup.unlocked ? "UNLOCKED" : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
