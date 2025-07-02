
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import NexusWorld from './pages/NexusWorld';
import NotFound from './pages/NotFound';
import { iPhoneFrameMinimal as IPhoneFrameMinimal } from '@/components/iPhoneFrameMinimal';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <IPhoneFrameMinimal>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nexus" element={<NexusWorld />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </IPhoneFrameMinimal>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
