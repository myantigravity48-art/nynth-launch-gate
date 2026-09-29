import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetCollection,
  useListSignups,
  useSendUnlockEmails,
  useSendBroadcastEmail,
  getListSignupsQueryKey,
  getGetCollectionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatLaunchDate(value: unknown): string {
  try {
    if (typeof value !== "string" || !value.trim()) return "—";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "—";
    const parts = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return `${get("month")} ${get("day")}, ${get("year")} — ${get("hour")}:${get("minute")} ${get("dayPeriod")} UTC`;
  } catch {
    return "—";
  }
}

function formatSignupDate(value: unknown): string {
  try {
    if (typeof value !== "string" || !value.trim()) return "Unknown date";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "Unknown date";
  }
}

export default function CollectionDetail() {
  const params = useParams();
  const slug = params.slug!;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: collection, isLoading: isCollectionLoading } = useGetCollection(slug, {
    query: { enabled: !!slug, queryKey: getGetCollectionQueryKey(slug) },
  });

  const { data: signups = [], isLoading: isSignupsLoading } = useListSignups(slug, {
    query: { enabled: !!slug, queryKey: getListSignupsQueryKey(slug) },
  });

  const sendUnlockEmails = useSendUnlockEmails();
  const sendBroadcast = useSendBroadcastEmail();

  // ── Unlock emails state ───────────────────────────────────────────────────
  const [showUnlockConfirmation, setShowUnlockConfirmation] = useState(false);
  const [sentUnlockCount, setSentUnlockCount] = useState(0);

  const hasPendingSignups = signups.some((s) => !s.unlocked);
  const isSendUnlockDisabled =
    sendUnlockEmails.isPending || !hasPendingSignups || isSignupsLoading;

  function handleSendUnlock() {
    sendUnlockEmails.mutate(
      { slug },
      {
        onSuccess: (result) => {
          setSentUnlockCount(result.sent);
          setShowUnlockConfirmation(true);
          queryClient.invalidateQueries({ queryKey: getListSignupsQueryKey(slug) });
          queryClient.invalidateQueries({ queryKey: getGetCollectionQueryKey(slug) });
        },
        onError: (err) => {
          toast({
            title: "Error sending unlock emails",
            description:
              (err as { data?: { error?: string } }).data?.error ||
              "An unexpected error occurred",
            variant: "destructive",
          });
        },
      },
    );
  }

  // ── Broadcast state ───────────────────────────────────────────────────────
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showBroadcastConfirmation, setShowBroadcastConfirmation] = useState(false);
  const [sentBroadcastCount, setSentBroadcastCount] = useState(0);

  const isBroadcastFormValid =
    broadcastSubject.trim().length > 0 && broadcastBody.trim().length > 0;

  function handleBroadcastSubmit() {
    if (!isBroadcastFormValid) return;
    setConfirmOpen(true);
  }

  function handleBroadcastConfirmed() {
    setConfirmOpen(false);
    sendBroadcast.mutate(
      { slug, data: { subject: broadcastSubject.trim(), body: broadcastBody.trim() } },
      {
        onSuccess: (result) => {
          setSentBroadcastCount(result.sent);
          setShowBroadcastConfirmation(true);
          setBroadcastOpen(false);
          setBroadcastSubject("");
          setBroadcastBody("");
        },
        onError: (err) => {
          toast({
            title: "Error sending broadcast",
            description:
              (err as { data?: { error?: string } }).data?.error ||
              "An unexpected error occurred",
            variant: "destructive",
          });
        },
      },
    );
  }

  // ── Loading / not found ───────────────────────────────────────────────────
  if (isCollectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <p className="text-sm font-medium tracking-widest text-muted-foreground">
          LOADING COLLECTION...
        </p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans gap-4">
        <p className="text-sm font-medium tracking-widest text-muted-foreground">
          COLLECTION NOT FOUND
        </p>
        <Link
          href="/"
          className="text-xs border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          RETURN TO DASHBOARD
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
            <h1
              className="text-3xl font-medium uppercase leading-none tracking-[-0.055em] sm:text-5xl"
              data-testid="text-collection-name"
            >
              {collection.name}
            </h1>
            <div className="mt-5 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-5">
              <span
                className="font-mono text-foreground/60"
                data-testid="text-collection-slug"
              >
                {collection.id}
              </span>
              <span className="hidden text-foreground/30 sm:inline" aria-hidden="true">
                /
              </span>
              <span data-testid="text-launch-date">
                {formatLaunchDate(collection.launchDatetime)}
              </span>
              <span
                className={`inline-flex w-fit items-center px-2 py-1 text-[10px] font-medium tracking-[0.16em] ${
                  collection.status === "locked"
                    ? "bg-foreground text-background"
                    : "border border-border"
                }`}
                data-testid={`badge-status-${collection.status}`}
              >
                {collection.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 lg:flex-col lg:items-end lg:gap-1">
            <span
              className="font-mono text-5xl font-medium leading-none tracking-[-0.08em] sm:text-6xl"
              data-testid="text-signup-count"
            >
              {signups.length}
            </span>
            <span className="pb-1 text-[11px] font-medium tracking-[0.2em] text-foreground/60 sm:text-xs lg:pb-0">
              SIGNUPS
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
        {/* ── Action banners ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1100px] space-y-3" aria-label="Email controls">
          {showUnlockConfirmation && (
            <div
              className="flex items-center justify-between gap-4 bg-foreground px-5 py-4 text-sm font-medium text-background"
              data-testid="banner-unlock-confirmation"
            >
              <span data-testid="text-unlock-sent-count">
                ✓ Unlock emails sent to {sentUnlockCount} signups.
              </span>
              <button
                className="cursor-pointer p-1 text-lg leading-none text-background/60 transition-colors hover:text-background focus:outline-none focus:ring-1 focus:ring-background"
                type="button"
                aria-label="Dismiss"
                onClick={() => setShowUnlockConfirmation(false)}
                data-testid="button-dismiss-unlock-confirmation"
              >
                ×
              </button>
            </div>
          )}
          {showBroadcastConfirmation && (
            <div
              className="flex items-center justify-between gap-4 border border-border px-5 py-4 text-sm font-medium"
              data-testid="banner-broadcast-confirmation"
            >
              <span data-testid="text-broadcast-sent-count">
                ✓ Broadcast sent to {sentBroadcastCount} signups.
              </span>
              <button
                className="cursor-pointer p-1 text-lg leading-none text-foreground/40 transition-colors hover:text-foreground focus:outline-none"
                type="button"
                aria-label="Dismiss"
                onClick={() => setShowBroadcastConfirmation(false)}
                data-testid="button-dismiss-broadcast-confirmation"
              >
                ×
              </button>
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 cursor-pointer bg-foreground px-8 py-5 text-base font-medium tracking-[0.12em] text-background transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-lg"
              type="button"
              disabled={isSendUnlockDisabled}
              onClick={handleSendUnlock}
              data-testid="button-send-unlock"
            >
              {sendUnlockEmails.isPending
                ? "SENDING..."
                : !hasPendingSignups
                  ? "ALL UNLOCKED"
                  : "SEND UNLOCK EMAILS"}
            </button>
            <button
              className="flex-1 cursor-pointer border border-foreground px-8 py-5 text-base font-medium tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
              type="button"
              disabled={signups.length === 0 || isSignupsLoading}
              onClick={() => setBroadcastOpen(true)}
              data-testid="button-open-broadcast"
            >
              SEND BROADCAST EMAIL
            </button>
          </div>
        </section>

        {/* ── Signup ledger ──────────────────────────────────────────── */}
        <section
          className="mx-auto mt-12 max-w-[1100px] sm:mt-16"
          aria-label="Collection signups"
        >
          <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-xs font-medium tracking-[0.18em]">SIGNUP LEDGER</h2>
            <span className="font-mono text-xs text-foreground/50">
              {signups.length.toString().padStart(2, "0")} RECORDS
            </span>
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
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading signups...
                    </td>
                  </tr>
                ) : signups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      No signups yet.
                    </td>
                  </tr>
                ) : (
                  signups.map((signup) => (
                    <tr
                      className="border-b border-border/10 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      key={signup.id}
                      data-testid={`row-signup-${signup.id}`}
                    >
                      <td className="px-6 py-3 font-mono text-xs sm:text-sm">
                        {signup.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm">
                        {formatSignupDate(signup.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-medium tracking-[0.14em] ${
                            signup.unlocked
                              ? "bg-foreground text-background"
                              : "border border-border text-foreground"
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

      {/* ── Broadcast compose modal ──────────────────────────────────────── */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent
          className="max-w-xl border border-border bg-background p-0 shadow-none"
          data-testid="dialog-broadcast"
        >
          <DialogHeader className="border-b border-border px-8 py-6">
            <DialogTitle className="text-sm font-medium tracking-[0.16em]">
              SEND BROADCAST EMAIL
            </DialogTitle>
            <p className="mt-2 text-xs text-foreground/50" data-testid="text-broadcast-recipient-count">
              Sending to all {signups.length} signup{signups.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium text-foreground">{collection.name}</span>
            </p>
          </DialogHeader>

          <div className="space-y-0">
            {/* Subject */}
            <div className="border-b border-border px-8 py-6">
              <label
                htmlFor="broadcast-subject"
                className="mb-3 block text-[10px] font-medium tracking-[0.18em] text-foreground/50"
              >
                SUBJECT
              </label>
              <input
                id="broadcast-subject"
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="e.g. Restock happening tomorrow"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                autoComplete="off"
                data-testid="input-broadcast-subject"
              />
            </div>

            {/* Body */}
            <div className="border-b border-border px-8 py-6">
              <label
                htmlFor="broadcast-body"
                className="mb-3 block text-[10px] font-medium tracking-[0.18em] text-foreground/50"
              >
                MESSAGE
              </label>
              <textarea
                id="broadcast-body"
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Write your message here..."
                rows={6}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                data-testid="textarea-broadcast-body"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-8 py-5">
              <button
                type="button"
                className="text-xs tracking-[0.1em] text-foreground/40 hover:text-foreground transition-colors focus:outline-none"
                onClick={() => setBroadcastOpen(false)}
                data-testid="button-broadcast-cancel"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!isBroadcastFormValid || sendBroadcast.isPending}
                onClick={handleBroadcastSubmit}
                className="cursor-pointer bg-foreground px-7 py-3 text-xs font-medium tracking-[0.12em] text-background transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                data-testid="button-broadcast-send"
              >
                {sendBroadcast.isPending ? "SENDING..." : "SEND BROADCAST"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm send AlertDialog ─────────────────────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          className="border border-border bg-background shadow-none"
          data-testid="alertdialog-broadcast-confirm"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium tracking-[-0.01em]">
              Send to {signups.length} {signups.length === 1 ? "person" : "people"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/60">
              This will send <span className="font-medium text-foreground">&ldquo;{broadcastSubject}&rdquo;</span> to every signup in{" "}
              <span className="font-medium text-foreground">{collection.name}</span>. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              className="border-border text-xs tracking-[0.1em] hover:bg-transparent hover:text-foreground"
              data-testid="button-confirm-cancel"
            >
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-foreground text-xs tracking-[0.1em] text-background hover:opacity-80"
              onClick={handleBroadcastConfirmed}
              data-testid="button-confirm-send"
            >
              SEND TO {signups.length}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
