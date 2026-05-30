import { useEffect, useRef, useState } from 'react';
import { Network } from '@capacitor/network';
import { CapacitorWifi } from '@capgo/capacitor-wifi';
import { Capacitor } from '@capacitor/core';

interface WifiUAODetectionOptions {
  targetSSID?: string;
  onConnectToTarget: () => void;
  enabled?: boolean;
}

export const useWifiUAODetection = ({
  targetSSID = 'WiFi-UAO',
  onConnectToTarget,
  enabled = true,
}: WifiUAODetectionOptions) => {
  const [currentSSID, setCurrentSSID] = useState<string | null>(null);
  const [wifiError, setWifiError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const hasShownAlert = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    let networkListener: any;
    let isMounted = true;

    const checkCurrentNetwork = async () => {
      try {
        const status = await Network.getStatus();
        
        if (status.connected) {
          try {
            if (Capacitor.isNativePlatform()) {
              const perm = await CapacitorWifi.checkPermissions();
              if (isMounted) setPermissionStatus(perm.location);
              
              if (perm.location !== 'granted') {
                const req = await CapacitorWifi.requestPermissions();
                if (isMounted) setPermissionStatus(req.location);
                if (req.location !== 'granted') {
                  if (isMounted) setWifiError('Permiso de ubicación denegado para WiFi');
                  return;
                }
              }
              
              const ssid = await CapacitorWifi.getSsid();
              if (isMounted) {
                let ssidName = ssid.ssid;
                console.log('[WiFi-Detection] Raw SSID detected on native device:', ssidName);
                
                // Normalizar SSID (quitar comillas y espacios adicionales)
                if (ssidName) {
                  ssidName = ssidName.replace(/^"|"$/g, '').trim();
                }
                console.log('[WiFi-Detection] Normalized SSID:', ssidName);
                
                setCurrentSSID(ssidName);
                setWifiError(null);
                
                // Comparación robusta insensible a mayúsculas y espacios
                const isTarget = ssidName && targetSSID && 
                  ssidName.toLowerCase() === targetSSID.trim().toLowerCase();
                
                // Verificar si es la red objetivo y no se ha mostrado la alerta
                if (isTarget && !hasShownAlert.current) {
                  console.log(`[WiFi-Detection] Target SSID matched! Triggering onConnectToTarget for: ${targetSSID}`);
                  hasShownAlert.current = true;
                  onConnectToTarget();
                }
                
                // Si no es la red objetivo, resetear el flag
                if (!isTarget) {
                  hasShownAlert.current = false;
                }
              }
            } else {
              if (isMounted) {
                setPermissionStatus('web-mock');
                setWifiError(null);
              }
              console.log('[WiFi-Detection] Running on web, use window.simulateWifiConnect("WiFi-UAO") to test');
            }
          } catch (wifiError: any) {
            console.error('Error getting SSID:', wifiError);
            if (isMounted) setWifiError(wifiError.message || String(wifiError));
          }
        } else {
          if (isMounted) {
            setCurrentSSID(null);
            setWifiError('Sin conexión de red');
            hasShownAlert.current = false;
          }
        }
      } catch (error: any) {
        console.error('Error checking network status:', error);
        if (isMounted) setWifiError(error.message || String(error));
      }
    };

    const setupNetworkListener = async () => {
      try {
        // Verificar red inicial
        await checkCurrentNetwork();

        // Escuchar cambios de red
        networkListener = await Network.addListener('networkStatusChange', async (status) => {
          if (isMounted) {
            await checkCurrentNetwork();
          }
        });
      } catch (error: any) {
        console.error('Error setting up network listener:', error);
        if (isMounted) setWifiError(error.message || String(error));
      }
    };

    setupNetworkListener();

    if (!Capacitor.isNativePlatform()) {
      // Expose a simulation helper on the window object when running on Web
      (window as any).simulateWifiConnect = (ssid: string) => {
        console.log(`[WiFi-Simulation] Simulating connection to SSID: "${ssid}"`);
        if (isMounted) {
          const cleanSSID = ssid ? ssid.trim().replace(/^"|"$/g, '').trim() : null;
          setCurrentSSID(cleanSSID);
          setWifiError(null);
          
          const isTarget = cleanSSID && targetSSID && 
            cleanSSID.toLowerCase() === targetSSID.trim().toLowerCase();
            
          if (isTarget) {
            if (!hasShownAlert.current) {
              hasShownAlert.current = true;
              onConnectToTarget();
            }
          } else {
            hasShownAlert.current = false;
          }
        }
      };
    }

    return () => {
      isMounted = false;
      if (networkListener) {
        networkListener.remove();
      }
      if ((window as any).simulateWifiConnect) {
        delete (window as any).simulateWifiConnect;
      }
    };
  }, [enabled, targetSSID, onConnectToTarget]);

  return { currentSSID, wifiError, permissionStatus };
};
