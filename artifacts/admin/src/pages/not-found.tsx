import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans">
      <div className="w-full max-w-md mx-4 border border-border p-6 flex flex-col items-center justify-center text-center">
        <div className="flex mb-4 gap-2 items-center">
          <AlertCircle className="h-8 w-8 text-foreground" />
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            404 Not Found
          </h1>
        </div>

        <p className="mt-4 text-sm text-foreground/60 tracking-wider">
          The requested path does not exist.
        </p>

        <Link href="/" className="mt-8 border border-border px-6 py-3 text-sm font-medium tracking-[0.08em] transition-colors hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4">
          ← BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
