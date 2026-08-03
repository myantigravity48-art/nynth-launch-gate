import "./_group.css";

import { FormEvent, useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const twelveDaysFromNow = () => Date.now() + 12 * 24 * 60 * 60 * 1000;

function getTimeLeft(target: number): TimeLeft {
  const distance = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(distance / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function LockedScreen() {
  const [target] = useState(twelveDaysFromNow);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(target),
  );
  const [email, setEmail] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [target]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsConfirmed(true);
  };

  const countdown = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col px-6 py-7 sm:px-10 sm:py-9 lg:px-14">
      <header className="flex items-center justify-between">
        <p className="font-['Space_Grotesk'] text-[11px] font-bold tracking-[0.48em]">
          NYNTH
        </p>
        <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.28em]">
          / 001
        </p>
      </header>

      <main className="flex flex-1 flex-col justify-center py-16 sm:py-20">
        <section className="mx-auto w-full max-w-[1180px] text-center">
          <p className="mb-5 font-['Space_Grotesk'] text-[10px] font-bold tracking-[0.4em] sm:mb-7 sm:text-xs">
            NYNTH WORLD PRESENTS
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-[clamp(4.2rem,16vw,13rem)] font-semibold leading-[0.7] tracking-[-0.065em]">
            SS26 — THE VOID
          </h1>

          <div className="mx-auto mt-14 max-w-[720px] sm:mt-20">
            <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.34em] sm:text-xs">
              COLLECTION DROPS IN
            </p>
            <div className="mt-6 grid grid-cols-4 divide-x divide-white border-y border-white py-4 sm:mt-8 sm:py-6">
              {countdown.map(({ value, label }) => (
                <div className="flex flex-col items-center gap-2" key={label}>
                  <span className="font-['Space_Grotesk'] text-2xl font-bold tabular-nums tracking-[-0.08em] sm:text-4xl md:text-5xl">
                    {pad(value)}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[8px] tracking-[0.2em] sm:text-[10px]">
                    {label.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 w-full max-w-[720px] sm:mt-28">
          {isConfirmed ? (
            <div className="border-t border-white pt-5 text-center sm:pt-7">
              <h2 className="font-['Cormorant_Garamond'] text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-6xl">
                YOU&apos;RE ON THE LIST.
              </h2>
              <p className="mt-4 font-['Space_Grotesk'] text-xs tracking-[0.08em] sm:text-sm">
                We&apos;ll email you when SS26 — The Void is live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                className="sr-only"
                htmlFor="nynth-email"
              >
                Email address
              </label>
              <input
                aria-describedby={hasError ? "nynth-email-error" : undefined}
                aria-invalid={hasError}
                autoComplete="email"
                className="h-14 w-full border-0 border-b border-white bg-black px-0 font-['Space_Grotesk'] text-sm text-white outline-none placeholder:text-white focus:border-b-2 sm:h-16 sm:text-base"
                id="nynth-email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (hasError) setHasError(false);
                }}
                placeholder="ENTER YOUR EMAIL"
                type="email"
                value={email}
              />
              <button
                className="mt-5 h-14 w-full bg-white font-['Space_Grotesk'] text-xs font-bold tracking-[0.3em] text-black transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black active:translate-y-0 sm:h-16"
                type="submit"
              >
                NOTIFY ME
              </button>
              <p
                className="mt-4 text-center font-['Space_Grotesk'] text-[10px] tracking-[0.08em]"
                id={hasError ? "nynth-email-error" : undefined}
              >
                {hasError
                  ? "PLEASE ENTER YOUR EMAIL ADDRESS."
                  : "You'll be the first to know when it drops."}
              </p>
            </form>
          )}
        </section>
      </main>

      <footer className="flex items-end justify-between font-['Space_Grotesk'] text-[9px] tracking-[0.22em]">
        <span>NYNTH WORLD / SS26</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

export default LockedScreen;