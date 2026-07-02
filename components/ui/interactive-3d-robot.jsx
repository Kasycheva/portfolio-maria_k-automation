'use client';

import { Component, Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

// WebGL is not guaranteed (weak GPUs, power saving, remote sessions). A Spline
// failure must degrade to the caller's fallback, not take down the whole page.
class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// Interactive 3D robot (Spline / WebGL). Heavy scene loaded from Spline CDN,
// so the caller is responsible for mounting it only where it makes sense
// (e.g. large screens). Lazy + Suspense keeps it out of the initial bundle.
export function InteractiveRobotSpline({ scene, className, style, onLoad, fallback }) {
  return (
    <SplineErrorBoundary fallback={fallback}>
      <Suspense fallback={null}>
        <Spline scene={scene} className={className} style={style} onLoad={onLoad} />
      </Suspense>
    </SplineErrorBoundary>
  );
}
