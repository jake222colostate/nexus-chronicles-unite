
import React, { Suspense } from 'react';

const GameEngine = React.lazy(() => import('@/components/GameEngine'));

const Index = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-white">
          Loading...
        </div>
      }
    >
      <GameEngine />
    </Suspense>
  );
};

export default Index;
