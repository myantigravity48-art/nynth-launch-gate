import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCreateCollection, getListCollectionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function toSlug(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const formSchema = z.object({
  name: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes"),
  launchDatetime: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date"),
});

export default function CreateCollection() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createCollection = useCreateCollection();

  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      launchDatetime: "",
    },
  });

  const watchName = form.watch("name");

  // Auto-fill slug from name if user hasn't explicitly edited slug
  useEffect(() => {
    // Only auto-fill if the user hasn't touched the slug field manually
    if (!form.getFieldState("slug").isDirty) {
      form.setValue("slug", toSlug(watchName), { shouldValidate: false });
    }
  }, [watchName, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const date = new Date(values.launchDatetime);
    
    createCollection.mutate({
      data: {
        name: values.name,
        slug: values.slug,
        launchDatetime: date.toISOString()
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        setSubmitted(true);
      },
      onError: (err) => {
        toast({
          title: "Error creating collection",
          description: (err as { data?: { error?: string } }).data?.error || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border px-8 py-5">
        <Link
          href="/"
          className="mb-5 block w-fit cursor-pointer text-left text-xs tracking-[0.02em] text-foreground/50 transition-colors hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-4"
          data-testid="link-back-dashboard"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-medium uppercase leading-none tracking-[-0.055em]">
          New Collection
        </h1>
      </header>

      <main className="mx-auto mt-12 max-w-lg px-8 pb-16">
        {submitted ? (
          <section aria-live="polite" data-testid="section-success">
            <p className="text-2xl font-medium tracking-[-0.04em]">
              <span aria-hidden="true" className="mr-2">
                ✓
              </span>
              Collection created.
            </p>
            <p className="mt-8 text-base leading-7">
              “{form.getValues().name}” is ready. Add it to your site using the slug:{" "}
              <span className="font-mono">{form.getValues().slug}</span>
            </p>
            <p className="mt-8 text-sm leading-6">
              Share the signup URL with your audience:
              <br />
              <span className="font-mono text-foreground/70">nynthworld.com/{form.getValues().slug}</span>
            </p>
            <Link
              href="/"
              className="mt-12 inline-block cursor-pointer border border-border px-6 py-3 text-sm font-medium tracking-[0.08em] transition-colors hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4"
              data-testid="link-success-dashboard"
            >
              ← BACK TO DASHBOARD
            </Link>
          </section>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="form-create-collection">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium tracking-[0.18em] text-foreground/60 uppercase">Collection Name</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="mt-3 block w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-foreground/35 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="e.g. SS26 — The Void"
                        data-testid="input-collection-name"
                        disabled={createCollection.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" data-testid="error-name" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium tracking-[0.18em] text-foreground/60 uppercase">Slug</FormLabel>
                    <FormDescription className="mt-1 text-xs text-foreground/40">
                      Auto-filled from name — edit to override
                    </FormDescription>
                    <FormControl>
                      <input
                        {...field}
                        className="mt-3 block w-full border border-border bg-background px-4 py-3 font-mono text-base text-foreground outline-none transition-shadow placeholder:text-foreground/35 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="e.g. ss26-the-void"
                        data-testid="input-collection-slug"
                        disabled={createCollection.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" data-testid="error-slug" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="launchDatetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium tracking-[0.18em] text-foreground/60 uppercase">Launch Date & Time (Local Time)</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="datetime-local"
                        className="mt-3 block w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        data-testid="input-launch-datetime"
                        disabled={createCollection.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" data-testid="error-launch-datetime" />
                  </FormItem>
                )}
              />

              <button
                className="w-full cursor-pointer bg-foreground px-8 py-4 text-base font-medium tracking-[0.16em] text-background transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                type="submit"
                data-testid="button-submit"
                disabled={createCollection.isPending}
              >
                {createCollection.isPending ? "CREATING..." : "CREATE COLLECTION"}
              </button>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}
