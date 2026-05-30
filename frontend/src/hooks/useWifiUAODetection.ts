import { useEffect, useRef, useState } from 'react';
import { Network } from '@capacitor/network';
import { CapacitorWifi } from '@capgo/capacitor-wifi';

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
  const hasShownAlert = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    let networkListener: any;
    let isMounted = true;

    const checkCurrentNetwork = async () => {
      try {
        const status = await Network.getStatus();
        
        if (status.connected && status.connectionType === 'wifi') {
          try {
            const ssid = await CapacitorWifi.getSsid();
            if (isMounted) {
              setCurrentSSID(ssid.ssid);
              
              // Verificar si es la red objetivo y no se ha mostrado la alerta
              if (ssid.ssid === targetSSID && !hasShownAlert.current) {
                hasShownAlert.current = true;
                onConnectToTarget();
              }
              
              // Si no es la red objetivo, resetear el flag
              if (ssid.ssid !== targetSSID) {
                hasShownAlert.current = false;
              }
            }
          } catch (wifiError) {
            console.error('Error getting SSID:', wifiError);
          }
        } else {
          if (isMounted) {
            setCurrentSSID(null);
            hasShownAlert.current = false;
          }
        }
      } catch (error) {
        console.error('Error checking network status:', error);
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
      } catch (error) {
        console.error('Error setting up network listener:', error);
      }
    };

    setupNetworkListener();

    return () => {
      isMounted = false;
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, [enabled, targetSSID, onConnectToTarget]);

  return { currentSSID };
};
