'use client';

import { Suspense, lazy } from 'react';
import { cn } from '@/lib/utils';

const Spline = lazy(() => import('@splinetool/react-spline'));

// Interactive 3D robot (Spline / WebGL). Heavy scene loaded from Spline CDN,
// so the caller is responsible for mounting it only where it makes sense
// (e.g. large screens). Lazy + Suspense keeps it out of the initial bundle.
export function InteractiveRobotSpline({ scene, className }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'flex h-full w-full items-center justify-center text-white/30',
            className,
          )}
        >
          <svg
            className="h-5 w-5 animate-spin text-[#c5ff00]/70"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
            />
          </svg>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
