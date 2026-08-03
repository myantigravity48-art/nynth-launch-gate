import { useState } from "react";
import "./_group.css";

function toSlug(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateCollection() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [launchDatetime, setLaunchDatetime] = useState("");
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(toSlug(val));
    if (errors.name) setErrors((previous) => ({ ...previous, name: undefined }));
  }

  function handleSubmit() {
    const errs: { name?: string; slug?: string } = {};
    if (!name.trim()) errs.name = "Required";
    if (!slug.trim()) errs.slug = "Required";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Space_Grotesk']">
      <header className="border-b border-black px-8 py-5">
        <button
          className="mb-5 block cursor-pointer text-left text-xs tracking-[0.02em] text-black/50 transition-colors hover:text-black focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-4"
          type="button"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-medium uppercase leading-none tracking-[-0.055em]">
          New Collection
        </h1>
      </header>

      <main className="mx-auto mt-12 max-w-lg px-8 pb-16">
        {submitted ? (
          <section aria-live="polite">
            <p className="text-2xl font-medium tracking-[-0.04em]">
              <span aria-hidden="true" className="mr-2">
                ✓
              </span>
              Collection created.
            </p>
            <p className="mt-8 text-base leading-7">
              “{name}” is ready. Add it to your site using the slug:{" "}
              <span className="font-mono">{slug}</span>
            </p>
            <p className="mt-8 text-sm leading-6">
              Share the signup URL with your audience:
              <br />
              <span className="font-mono text-black/70">nynthworld.com/{slug}</span>
            </p>
            <button
              className="mt-12 cursor-pointer border border-black px-6 py-3 text-sm font-medium tracking-[0.08em] transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4"
              type="button"
            >
              ← BACK TO DASHBOARD
            </button>
          </section>
        ) : (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="block text-xs font-medium tracking-[0.18em] text-black/60" htmlFor="collection-name">
                COLLECTION NAME
              </label>
              <input
                className="mt-3 block w-full border border-black bg-white px-4 py-3 text-base text-black outline-none transition-shadow placeholder:text-black/35 focus:ring-2 focus:ring-black focus:ring-offset-2"
                id="collection-name"
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="e.g. SS26 — The Void"
                type="text"
                value={name}
              />
              {errors.name && <p className="mt-2 text-xs text-black">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.18em] text-black/60" htmlFor="collection-slug">
                SLUG
              </label>
              <p className="mt-1 text-xs text-black/40">Auto-filled from name — edit to override</p>
              <input
                className="mt-3 block w-full border border-black bg-white px-4 py-3 font-mono text-base text-black outline-none transition-shadow placeholder:text-black/35 focus:ring-2 focus:ring-black focus:ring-offset-2"
                id="collection-slug"
                onChange={(event) => {
                  setSlug(event.target.value);
                  if (errors.slug) setErrors((previous) => ({ ...previous, slug: undefined }));
                }}
                placeholder="e.g. ss26-the-void"
                type="text"
                value={slug}
              />
              {errors.slug && <p className="mt-2 text-xs text-black">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.18em] text-black/60" htmlFor="launch-datetime">
                LAUNCH DATE &amp; TIME
              </label>
              <input
                className="mt-3 block w-full border border-black bg-white px-4 py-3 text-base text-black outline-none transition-shadow focus:ring-2 focus:ring-black focus:ring-offset-2"
                id="launch-datetime"
                onChange={(event) => setLaunchDatetime(event.target.value)}
                type="datetime-local"
                value={launchDatetime}
              />
            </div>

            <button
              className="w-full cursor-pointer bg-black px-8 py-4 text-base font-medium tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4 active:translate-y-0"
              type="submit"
            >
              CREATE COLLECTION
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default CreateCollection;