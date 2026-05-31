# Proyecto Final Desarrollo de Software para Plataformas Móviles
**Diseñado y construido por**: Sergio Talero G.

## Aplicacion para calcular el promedio de notas

Implementación del proyecto final para el curso de Desarrollo de Sistemas en Plataformas Móviles en la Universidad Autónoma de Occidente (UAO).
El sistema integra tecnologías web y moviles, almacenamiento distribuido y persistencia en tiempo real.

---

##  Etapa Backend

### Validación del Servidor de Producción
El Backend del ecosistema se encuentra desplegado de forma centralizada y puede ser validado a través de su Endpoint de salud (`health check`).

* **URL de Validación Operativa:** [https://dspm-backend-ttdg.onrender.com/api/health](https://dspm-backend-ttdg.onrender.com/api/health)
* **Formato de Respuesta Esperada (JSON):**
```
  {"status":"OK","message":"Backend conectado a Firestore correctamente"}
```

## Ejecución en local (web browser en pc)

### Clonar el proyecto
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

### 1. Usar en PC (navegador web) 

Esto solo con fines de prueba ya que por el uso de sensores este proyecto esta pensado para usarlo en moviles Android.
```
ionic serve
```

### 2. Usar movil Android 
Ya teniendo instalado capacitor para el uso de sensores, instalamos la aplicación mediante los siguientes comandos:
```
ionic cap sync android
ionic cap run android
```

## Correr la aplicación
Para probar en windows ir a la url:
```
http://localhost:8100/home
```

Para probar en el movil Android:
```
En el escritorio del movil buscar el icono que dice "frontend".
```
