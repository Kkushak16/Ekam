import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" style={{ padding: '24px', color: 'var(--text-primary)', background: 'var(--bg-app)', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Something went wrong 😭</h2>
      <pre style={{ padding: '16px', background: 'var(--bg-bubble-them)', borderRadius: '8px', color: '#ef4444' }}>{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        style={{ padding: '10px 20px', background: 'var(--bg-bubble-me)', color: 'var(--text-me)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Try again
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
