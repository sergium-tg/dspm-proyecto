import { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonAlert, IonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './context/AuthContext';
import { useWifiUAODetection } from './hooks/useWifiUAODetection';
import { useLightDetection } from './hooks/useLightDetection';
import { notificationService } from './services/notificationService';
import { Haptics } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import Index from './pages/Index';
import Login from './pages/Login';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Asignaturas from './pages/Asignaturas';
import AsignaturaDetalle from './pages/AsignaturaDetalle';
import NotaDetalle from './pages/NotaDetalle';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';
import './theme/global.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const [showWifiAlert, setShowWifiAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notificaciones simuladas
  const [incomingNotification, setIncomingNotification] = useState<{ title: string; message: string } | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Manejar cambio a tema oscuro
  const handleDarkMode = () => {
    setIsDarkMode(true);
    document.body.classList.add('dark');
  };

  // Manejar cambio a tema claro
  const handleLightMode = () => {
    setIsDarkMode(false);
    document.body.classList.remove('dark');
  };

  // Función para vibrar 3 veces de forma robusta
  const vibrateThreeTimes = async () => {
    try {
      console.log('[Haptics] Desencadenando vibración triple...');
      for (let i = 0; i < 3; i++) {
        await Haptics.vibrate({ duration: 300 });
        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.warn('[Haptics] No disponible en esta plataforma, usando fallback navigator.vibrate:', error);
      if (navigator.vibrate) {
        navigator.vibrate([300, 200, 300, 200, 300]);
      }
    }
  };

  const { currentSSID, wifiError, permissionStatus } = useWifiUAODetection({
    targetSSID: 'WiFi-UAO',
    onConnectToTarget: () => {
      setShowWifiAlert(true);
      vibrateThreeTimes();
    },
    enabled: true,
  });

  useLightDetection({
    onDarkMode: handleDarkMode,
    onLightMode: handleLightMode,
    enabled: true,
    lightThreshold: 50, // Below 50 lux is considered dark
  });

  // Silenciar notificaciones al conectarse a WiFi-UAO y habilitar al desconectar
  useEffect(() => {
    const isTarget = currentSSID && currentSSID.trim().toLowerCase() === 'wifi-uao'.toLowerCase();
    if (isTarget) {
      notificationService.setNotificationsSilenced(true);
    } else {
      notificationService.setNotificationsSilenced(false);
    }
  }, [currentSSID]);

  // Cargar tema inicial basado en preferencia del sistema y escuchar cambios
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      handleDarkMode();
    }

    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        handleDarkMode();
      } else {
        handleLightMode();
      }
    };

    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);

  // Escuchar notificaciones del servicio central de notificaciones
  useEffect(() => {
    const removeListener = notificationService.addListener((title, message) => {
      setIncomingNotification({ title, message });
      setShowNotificationToast(true);
    });
    return () => removeListener();
  }, []);

  // Simular llegada de notificaciones periódicas (cada 20 segundos) para prueba (DESACTIVADO A PETICIÓN)
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      const titles = [
        'Nueva nota registrada',
        'Recordatorio de clase',
        'Actualización de promedio',
        'Mensaje de profesor'
      ];
      const messages = [
        'Se ha subido una nueva calificación en la materia de Móviles.',
        'Tu clase de DSPM inicia en 15 minutos en el salón 4102.',
        'Tu promedio semestral ha sido recalculado con éxito.',
        'El profesor ha publicado el material de estudio para el examen final.'
      ];

      const randomIndex = Math.floor(Math.random() * titles.length);
      notificationService.receiveNotification(titles[randomIndex], messages[randomIndex]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);
  */

  return (
    <>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/perfil" component={Perfil} />
        <Route exact path="/asignaturas" component={Asignaturas} />
        <Route exact path="/asignaturas/:id" component={AsignaturaDetalle} />
        <Route exact path="/asignaturas/:idAsignatura/notas/:idNota" component={NotaDetalle} />
        <Route exact path="/" component={Index} />
        <Route>
          <Redirect to="/" />
        </Route>
      </IonRouterOutlet>
      <IonAlert
        isOpen={showWifiAlert}
        onDidDismiss={() => setShowWifiAlert(false)}
        header="Conexión WiFi-UAO"
        message="Se silenció el dispositivo ya que estas en el campus UAO, recuerda activar sonido al salir"
        buttons={['OK']}
      />
      {/* IonToast para notificaciones en la parte inferior desactivado a petición del usuario */}
      {/* 
      <IonToast
        isOpen={showNotificationToast}
        onDidDismiss={() => setShowNotificationToast(false)}
        header={incomingNotification?.title}
        message={incomingNotification?.message}
        duration={4000}
        position="bottom"
        color="primary"
      />
      */}
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
