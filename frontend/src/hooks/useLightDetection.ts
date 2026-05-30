import { useEffect, useRef, useCallback } from 'react';
import { LightSensor } from '@capgo/capacitor-light-sensor';
import { Capacitor } from '@capacitor/core';

interface LightDetectionOptions {
  onDarkMode: () => void;
  onLightMode: () => void;
  enabled?: boolean;
  lightThreshold?: number; // lux value below this is considered dark
}

export const useLightDetection = ({
  onDarkMode,
  onLightMode,
  enabled = true,
  lightThreshold = 50, // Below 50 lux is considered dark
}: LightDetectionOptions) => {
  const lastModeRef = useRef<'dark' | 'light' | null>(null);
  const listenerHandleRef = useRef<any>(null);

  const handleLightChange = useCallback((data: { illuminance: number }) => {
    if (!enabled) return;

    const illuminance = data.illuminance;
    const isDark = illuminance < lightThreshold;
    const currentMode = isDark ? 'dark' : 'light';

    // Only trigger callback if mode changed
    if (lastModeRef.current !== currentMode) {
      lastModeRef.current = currentMode;
      
      if (isDark) {
        onDarkMode();
      } else {
        onLightMode();
      }
    }
  }, [enabled, lightThreshold, onDarkMode, onLightMode]);

  useEffect(() => {
    if (!enabled || !Capacitor.isNativePlatform()) return;

    let isMounted = true;

    const setupLightSensor = async () => {
      try {
        // Check if light sensor is available
        const { available } = await LightSensor.isAvailable();
        
        if (!available) {
          console.warn('Light sensor not available on this device');
          return;
        }

        // Request permissions if needed
        try {
          await LightSensor.requestPermissions();
        } catch (permError) {
          console.warn('Permission request failed:', permError);
        }

        // Start the light sensor
        await LightSensor.start({ updateInterval: 1000 }); // Update every second

        // Add listener for light sensor changes
        if (isMounted) {
          const handle = await LightSensor.addListener('lightSensorChange', handleLightChange);
          listenerHandleRef.current = handle;
        }
      } catch (error) {
        console.error('Error setting up light sensor:', error);
      }
    };

    setupLightSensor();

    return () => {
      isMounted = false;
      
      // Remove listener
      if (listenerHandleRef.current) {
        listenerHandleRef.current.remove();
        listenerHandleRef.current = null;
      }

      // Stop the sensor
      LightSensor.stop().catch(error => {
        console.error('Error stopping light sensor:', error);
      });
    };
  }, [enabled, handleLightChange]);

  return null;
};
