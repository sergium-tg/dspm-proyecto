import { useEffect, useRef, useCallback } from 'react';
import { Motion, AccelListenerEvent } from '@capacitor/motion';

interface ShakeDetectionOptions {
  threshold?: number;
  debounceDelay?: number;
  onShake: () => void;
  enabled?: boolean;
}

export const useShakeDetection = ({
  threshold = 15,
  debounceDelay = 500,
  onShake,
  enabled = true,
}: ShakeDetectionOptions) => {
  const lastShakeTime = useRef<number>(0);
  const lastAcceleration = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  const handleAcceleration = useCallback((data: AccelListenerEvent) => {
    if (!enabled) return;

    const now = Date.now();
    if (now - lastShakeTime.current < debounceDelay) return;

    const { x, y, z } = data.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    const lastX = lastAcceleration.current.x;
    const lastY = lastAcceleration.current.y;
    const lastZ = lastAcceleration.current.z;

    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);

    const deltaTotal = deltaX + deltaY + deltaZ;

    if (deltaTotal > threshold) {
      lastShakeTime.current = now;
      onShake();
    }

    lastAcceleration.current = { x, y, z };
  }, [threshold, debounceDelay, onShake, enabled]);

  useEffect(() => {
    if (!enabled) return;

    let listenerHandle: any;

    const startMonitoring = async () => {
      try {
        // Check if motion is available
        const result = await Motion.addListener('accel', (data: AccelListenerEvent) => {
          handleAcceleration(data);
        });
        listenerHandle = result;
      } catch (error) {
        console.error('Error starting motion monitoring:', error);
      }
    };

    startMonitoring();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [enabled, handleAcceleration]);

  return null;
};
