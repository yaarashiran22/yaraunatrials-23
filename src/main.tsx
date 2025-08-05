import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 120000, // 2 minutes - increased for better caching
      gcTime: 600000, // 10 minutes - increased for better persistence
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Only refetch if data is stale
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: 500, // Faster retry
      networkMode: 'online', // Only fetch when online
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
