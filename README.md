# Proyecto Final Desarrollo de Software para Plataformas Móviles
**Diseñado y construido por**: Sergio Talero G.

Para esta ocuación el trabajo Final se realizó en individual

## Aplicacion para calcular el promedio de notas

Implementación del proyecto final para el curso de Desarrollo de Software para Plataformas Móviles en la Universidad Autónoma de Occidente (UAO).
El sistema integra tecnologías web y moviles, almacenamiento distribuido y persistencia en tiempo real.

---

##  1. Etapa Backend

### 1.1 Validación del Servidor de Producción
El Backend del ecosistema se encuentra desplegado de forma centralizada y puede ser validado a través de su Endpoint de salud (`health check`).

* **URL de Validación Operativa:** [https://dspm-backend-ttdg.onrender.com/api/health](https://dspm-backend-ttdg.onrender.com/api/health)
* **Formato de Respuesta Esperada (JSON):**
```
  {"status":"OK","message":"Backend conectado a Firestore correctamente"}
```

## 2. Ejecución

### 2.1 Clonar el proyecto
Para probar el proyecto lo abordaremos de dos formas: 1. Navegador web en una PC y 2. Smartphone Android.

Primero que todo descargamos el proyecto.

```
git clone https://github.com/sergium-tg/dspm-proyecto.git
cd dspm-proyecto/frontend
```

Instalación de dependencias
```
npm install
```

Instalación de sensores
```
npm install @capgo/capacitor-light-sensor
npm install @capacitor/motion
```

### 2.2. Usar en PC (navegador web) 

Esto solo con fines de prueba ya que por el uso de sensores este proyecto esta pensado para usarlo en moviles Android.
```
ionic serve
```

### 2.3 Usar movil Android 
Ya teniendo instalado capacitor para el uso de sensores, instalamos la aplicación mediante los siguientes comandos:
```
ionic cap sync android
ionic cap run android
```

### 2.4 Correr la aplicación
Para probar en windows ir a la url:
```
http://localhost:8100/home
```

Para probar en el movil Android:
```
En el escritorio del movil buscar el icono que dice "frontend".
```

### 2.5 Usuario de pruebas
Para facillitar observar rapidamente los resultados de las pruebas de la logica de negocio, en la base de datos existe un usuario con el que se hizo las validaciones de la aplicacion.
```
correo: user@mail.com
contraseña: User123*
```


## 3. Prototipo
Posterior al diseño de la estructura de datos (incluido el diagrama MER) se realizó la construcción de una aplicación PROTOTIPO mediante la herramienta de IA "LOVABLE".

-**El link del repositorio:** [https://github.com/sergium-tg/gradebook-genie.git](https://github.com/sergium-tg/gradebook-genie)

-**Dentro de este proyecto:** la ruta /prototipo/ dentro del repositorio

## 4. Lista de APIs de Backend Consumidas

Todos los endpoints base utilizan la URL configurada en las variables de entorno (`API_BASE_URL`). Los identificadores (`id`) son de tipo numérico (`Number`).

### 1. Autenticación y Usuarios
* **GET** `/usuarios?email={email}` - Obtiene el perfil del usuario mediante su correo electrónico para validar la sesión.
* **POST** `/usuarios` - Registra un nuevo usuario en la base de datos del sistema.

### 2. Datos del Estudiante
* **GET** `/estudiantes?idUsuario={idUsuario}` - Recupera la información académica y personal vinculada al usuario autenticado.

### 3. Asignaturas
* **GET** `/asignaturas?idEstudiante={idEstudiante}` - Lista todas las materias inscritas por un estudiante específico.
* **GET** `/asignaturas/{id}` - Obtiene el detalle completo de una asignatura particular.

### 4. Calificaciones y Evaluaciones
* **GET** `/notas?idAsignatura={idAsignatura}` - Recupera el listado de evaluaciones, porcentajes y calificaciones de una materia.
* **GET** `/notas/{id}` - Obtiene el detalle de una calificación específica.

### 5. Resumen Académico
* **GET** `/academicSummary?idEstudiante={idEstudiante}` - Consume los consolidados estadísticos del estudiante (promedio acumulado, créditos aprobados, etc.).
