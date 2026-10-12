import { useState, useEffect, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import Dashboard from '@/pages/dashboard';
import CreateCollection from '@/pages/collection-create';
import CollectionDetail from '@/pages/collection-detail';

const queryClient = new QueryClient();
const TOKEN_KEY = 'lg_admin_token';

function AdminGate({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    setAuthTokenGetter(() => sessionStorage.getItem(TOKEN_KEY));
  }, []);

  useEffect(() => {
    if (!token) return;
    setChecking(true);
    fetch('/api/collections', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.ok) return;
        throw new Error('session invalid');
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError('Invalid password');
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, password);
    setToken(password);
    setPassword('');
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4 p-6 bg-white border rounded-lg shadow-sm">
          <h1 className="text-lg font-bold">Nynth Launch Gate — Admin</h1>
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    );
  }
  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Checking session…</div>;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/collections/new" component={CreateCollection} />
      <Route path="/collections/:slug" component={CollectionDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AdminGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
