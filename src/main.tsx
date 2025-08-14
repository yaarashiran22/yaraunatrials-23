import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes - much longer for instant loading
      gcTime: 1800000, // 30 minutes - much longer persistence
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Always use cached data if available
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: 250, // Even faster retry
      networkMode: 'online', // Only fetch when online
      placeholderData: (previousData) => previousData, // Keep showing old data while fetching
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
