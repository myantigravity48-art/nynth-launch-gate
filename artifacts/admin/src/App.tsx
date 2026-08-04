import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Dashboard from '@/pages/dashboard';
import CreateCollection from '@/pages/collection-create';
import CollectionDetail from '@/pages/collection-detail';

const queryClient = new QueryClient();

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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
