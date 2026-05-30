import { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './context/AuthContext';
import { useWifiUAODetection } from './hooks/useWifiUAODetection';
import { useLightDetection } from './hooks/useLightDetection';
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

  useWifiUAODetection({
    targetSSID: 'WiFi-UAO',
    onConnectToTarget: () => {
      setShowWifiAlert(true);
    },
    enabled: true,
  });

  useLightDetection({
    onDarkMode: handleDarkMode,
    onLightMode: handleLightMode,
    enabled: true,
    lightThreshold: 50, // Below 50 lux is considered dark
  });

  // Cargar tema inicial basado en preferencia del sistema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      handleDarkMode();
    }
  }, []);

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
        message="Se desactivaran todas la notificaciones mientras estas en el campus UAO"
        buttons={['OK']}
      />
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
