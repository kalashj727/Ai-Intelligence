import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import IntelligenceSearch from './pages/IntelligenceSearch';
import Investigations from './pages/Investigations';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import TimelineExplorer from './pages/TimelineExplorer';
import GraphExplorer from './pages/GraphExplorer';
import Reports from './pages/Reports';
import AppSettings from './pages/AppSettings';
import AppShell from './components/layout/AppShell';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-muted-foreground tracking-wider">INITIALIZING NEXUS...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<IntelligenceSearch />} />
        <Route path="/investigations" element={<Investigations />} />
        <Route path="/investigation" element={<InvestigationWorkspace />} />
        <Route path="/timeline" element={<TimelineExplorer />} />
        <Route path="/graph" element={<GraphExplorer />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<AppSettings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
