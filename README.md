# ProyectoFinalI


Este es un proyecto full-stack desarrollado como parte de un trabajo integrador académico. Consiste en:

- ✨ **Frontend**: Aplicación web hecha en React.
- 🔐 **Backend**: API REST construida con Spring Boot que gestiona usuarios, autenticación y datos.

---

## 🧱 Estructura del Proyecto

```
.
├── backend/        # API en Java con Spring Boot
│   ├── pom.xml     # Configuración de Maven
│   └── src/        # Código fuente del backend
│
└── frontend/       # Interfaz de usuario con React
    ├── package.json
    ├── tailwind.config.js
    └── src/        # Componentes y lógica del frontend
```

---

## 🌐 Frontend (React)

### Tecnologías

- React
- PostCSS & Autoprefixer
- Vite o Create React App (según versión final)

### Requisitos

- Node.js >= 16.x
- npm >= 7.x

### Instalación

```bash
cd frontend
npm install
npm run start     # o npm run dev si usas Vite
```

> Asegúrate de que el archivo `.env` (si existe) apunte al backend, por ejemplo:
>
> ```
> VITE_API_URL=http://localhost:8080/api
> ```

---

## ⚙️ Backend (Java + Spring Boot)

### Tecnologías

- Java 17+
- Spring Boot
- Spring Security
- Maven

### Instalación

```bash
cd backend
./mvn spring-boot:run
```

> También puedes importar `backend/` en **NetBeans**, **IntelliJ** o **VS Code con Java Extension Pack**.

### Configuración

Este backend soporta conexión con bases de datos **MySQL** y **Oracle**.

#### 🔗 Configuración para MySQL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tu_base_de_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

#### 🔗 Configuración para Oracle:
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
```

> Asegúrate de tener las dependencias correctas en el `pom.xml` para el driver de Oracle o MySQL.

Edita `src/main/resources/application.properties` para aplicar esta configuración según la base de datos que utilices.

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/tu_base_de_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

---

## 🔄 Conexión entre frontend y backend

Asegúrate de que ambos servicios estén corriendo al mismo tiempo.

- Frontend: http://localhost:3000/
- Backend API: http://localhost:8080/

El frontend consume los endpoints del backend a través de fetch/Axios usando la URL definida en el entorno (`VITE_API_URL`, `.env`, etc.).

---

## 🧪 Scripts comunes

### Frontend

| Comando          | Descripción                         |
|------------------|-------------------------------------|
| `npm run start`  | Inicia el frontend en modo desarrollo |
| `npm run build`  | Compila el proyecto para producción  |

### Backend

| Comando                      | Descripción                          |
|------------------------------|--------------------------------------|
| `./mvn spring-boot:run`     | Levanta el servidor Spring Boot      |
| `mvn clean install`          | Compila y empaqueta el proyecto      |

---

## 🛠️ Mejora futura

- Agregar autenticación JWT
- Despliegue en Vercel (frontend) y Render o Railway (backend)
- Integrar base de datos PostgreSQL en la nube

---

## 👤 Autor

Tu nombre aquí  
Proyecto académico - Año 2025

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la [MIT License](https://opensource.org/licenses/MIT).
