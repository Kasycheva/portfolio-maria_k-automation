'use client';
import { useEffect, useState } from 'react';

// Conservative device-capability detection. Decides between a "full" experience
// (frame-scrub video, WebGL robot, 3D scrubs) and a "lite" one for weak devices.
//
// It flags "lite" ONLY on signals that mean the device is genuinely weak — never
// on the platform/brand. `deviceMemory` is the primary signal and is exposed only
// by Chromium (Android/desktop), never by Safari/iOS, so:
//   - a strong Android (>= 4 GB) stays FULL, identical to iPhone;
//   - a weak Android (2-3 GB) / data-saver / reduced-motion drops to LITE;
//   - iPhone/iPad can't be downgraded by memory and default to FULL — which
//     matches reality (iOS decodes scrubbed video smoothly).

// Detects a real, hardware-accelerated WebGL context. Rejects when WebGL is
// missing or backed by a software renderer (SwiftShader / llvmpipe / ANGLE
// software) — those choke on the Spline robot even when memory looks fine.
function hasHardwareWebGL() {
  if (typeof document === 'undefined') return false;
  let canvas = null;
  try {
    canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      ).toLowerCase();
      if (
        renderer.includes('swiftshader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('software') ||
        renderer.includes('microsoft basic')
      ) {
        return false;
      }
    }
    return true;
  } catch (_error) {
    return false;
  } finally {
    // Free the probe context promptly.
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext?.();
    }
  }
}

// Returns { ready, tier, lowPower, canRenderRobot }.
// - `tier`: 'full' | 'lite'. 'lite' when the device is weak OR the user asked for
//   reduced motion. Drives motion-heavy things (WebGL robot, 3D scrubs, seek rate).
// - `lowPower`: only the genuine weakness signals (low memory / data-saver), NOT
//   reduced motion. Drives things where we shouldn't drop quality just because a
//   user dislikes motion — e.g. the Hero video resolution on a capable desktop.
// - `ready`: false for the first synchronous render (SSR + hydration), then true.
//   The defaults keep capable devices on the full experience with no degraded
//   first paint; the robot additionally waits for `canRenderRobot`.
export function useDeviceCapability() {
  const [state, setState] = useState({
    ready: false,
    tier: 'full',
    lowPower: false,
    canRenderRobot: false,
  });

  useEffect(() => {
    const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
    const lowMemory = typeof mem === 'number' && mem < 4;
    const saveData =
      typeof navigator !== 'undefined' && navigator.connection
        ? Boolean(navigator.connection.saveData)
        : false;
    const reduced =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const lowPower = lowMemory || saveData;
    const tier = lowPower || reduced ? 'lite' : 'full';
    const canRenderRobot = tier === 'full' && hasHardwareWebGL();

    setState({ ready: true, tier, lowPower, canRenderRobot });
  }, []);

  return state;
}
