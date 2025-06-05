
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { iPhoneFrameMinimal as IPhoneFrameMinimal } from '@/components/iPhoneFrameMinimal';

const Index = React.lazy(() => import('./pages/Index'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <IPhoneFrameMinimal>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-white">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </IPhoneFrameMinimal>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
