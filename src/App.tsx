
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { iPhoneFrame } from '@/components/iPhoneFrame';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <iPhoneFrame>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </iPhoneFrame>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
