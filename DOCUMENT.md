# Documento Técnico Final: **Alcance y Arquitectura de Tecnologías Móviles**

**Institución:** Universidad Autónoma de Occidente.

**Curso:** Desarrollo de Sistemas en Plataformas Móviles.

**Integrante grupo:** SERGIO TALERO G.


---

## 1. Alcance del Sistema
El sistema se diseño como una solución móvil para que el estudiante que quiere tener un panorama más claro acerca de sus notas, asignaturas y promedio pueda estimar qué tanta nota extra o minima necesita para mantener el programa al que pertenece dependiendo de becas o de su intención académica.
Permite la autenticación segura, la visualización detallada de asignaturas y de notas, y la adaptación dinámica de la interfaz mediante la captura de eventos físicos del entorno.

### Funcionalidades Implementadas:
- **Control de Seguridad y Sesiones:** Flujo completo de Login y Registro vinculado a tokens de Firebase Authentication con persistencia en tiempo real.
- **Módulo de Rendimiento Académico:** Listado dinámico de asignaturas matriculadas, cálculo matemático de promedios ponderados e historial detallado de evaluaciones.
- **Transacción y Almacenamiento Distribuido:** Consumo estructurado de base de datos remota para asegurar la persistencia de los perfiles estudiantiles.
---

## 2. Tecnologías Utilizadas

- **Framework Móvil:** `Ionic Framework` con `React` y `Vite` para garantizar un renderizado fluido y una experiencia de interfaz nativa multi-pantalla.
- **Lenguaje:** `TypeScript` para un desarrollo robusto respaldado por tipado estático estricto.
- **Control e Integración de Hardware (Capacitor Plugins):**
  - `@capgo/capacitor-light-sensor`: Interfaz nativa para el Luxómetro del teléfono, conmutando la interfaz a modo oscuro de manera automática si los niveles de lux descienden del umbral establecido.
  - `@capacitor/motion`: Captura de datos brutos del acelerómetro para disparar alertas inmediatas o refrescos de pantalla mediante el gesto físico de agitación (`shake detection`).
- **Persistencia y Autenticación:** `Firebase SDK` (Auth en tiempo real) combinado con un backend RESTful remoto construido sobre `Express.js` y desplegado en entornos distribuidos (`Render`).
- **Cliente de Red:** `Axios` para el consumo de las API Restful.
---

## 3. Arquitectura y Consumo de APIs (Ejemplos Detallados)

El backend consume servicios RESTful protegidos. A continuación, se detallan los contratos de datos y ejemplos exactos de llamadas y respuestas gestionados por el módulo `apiClient.ts`:

### 📋 API 1: Validación de Estado del Sistema (Health Check)
* **Método HTTP:** `GET`
* **Endpoint:** `https://dspm-backend-ttdg.onrender.com/api/health`
* **Descripción:** Permite despertar y comprobar la disponibilidad operativa del backend y sus conexiones internas con la base de datos sin requerir token de sesión.
* **Ejemplo de Código de Consumo (Axios):**
  ```typescript
  const checkHealth = async () => {
    const response = await axios.get('[https://dspm-backend-ttdg.onrender.com/api/health](https://dspm-backend-ttdg.onrender.com/api/health)');
    return response.data;
  };
  ---

## 4. Prototipo
Posterior al diseño de la estructura de datos (incluido el diagrama MER) se realizó la construcción de una aplicación PROTOTIPO mediante la herramienta de IA "LOVABLE".

-**El link del repositorio:** [https://github.com/sergium-tg/gradebook-genie.git](https://github.com/sergium-tg/gradebook-genie)

-**Dentro de este proyecto:** la ruta /prototipo/ dentro del repositorio
