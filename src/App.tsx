
console.log('📱 App.tsx loading...');
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import NexusWorld from './pages/NexusWorld';
import NotFound from './pages/NotFound';
console.log('✅ App.tsx imports completed');

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nexus-world" element={<NexusWorld />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
