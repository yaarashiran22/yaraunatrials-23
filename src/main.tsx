import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes - ultra-aggressive caching
      gcTime: 1000 * 60 * 60, // 1 hour - keep data in memory much longer  
      refetchOnWindowFocus: false,
      refetchOnMount: false, 
      refetchOnReconnect: false,
      retry: 0, // No retries for instant loading
      networkMode: 'online',
      placeholderData: (previousData) => previousData,
    },
  },
})

console.log('Main.tsx: Starting to render');

const rootElement = document.getElementById("root");
console.log('Main.tsx: Root element found:', rootElement);

createRoot(rootElement!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

console.log('Main.tsx: Render complete');
