# Vet-Sync API veterinaria

API RESTful para la gestión de una clínica veterinaria. Permite administrar citas, pacientes (mascotas), veterinarios, servicios y más. Construida con Node.js, Express y Supabase.

---

## 📋 Tabla de Contenidos

1.  [Acerca del Proyecto](#-acerca-del-proyecto)
2.  [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3.  [Comenzando](#-comenzando)
    *   [Pre-requisitos](#pre-requisitos)
    *   [Instalación](#instalación)
4.  [Uso](#-uso)
5.  [Endpoints de la API](#-endpoints-de-la-api)
6.  [Licencia](#-licencia)
7.  [Autor](#-autor)

---

## 🚀 Acerca del Proyecto

**Vet-Sync** es el backend de una aplicación de gestión veterinaria. Proporciona una base sólida y escalable para manejar toda la información relevante de la clínica, desde la autenticación de usuarios hasta la programación de citas y la gestión de expedientes de mascotas.

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js**: Entorno de ejecución para JavaScript.
*   **Express**: Framework para la creación de la API REST.
*   **Supabase**: BaaS (Backend as a Service) utilizado para la base de datos PostgreSQL y autenticación.
*   **JSON Web Tokens (JWT)**: Para proteger las rutas y gestionar sesiones.
*   **Zod**: Para la validación de esquemas y datos de entrada.
*   **Bcrypt**: Para el hasheo seguro de contraseñas.
*   **ESLint**: Para el linting y mantenimiento de la calidad del código.

---

## 🏁 Comenzando

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Pre-requisitos

Asegúrate de tener instalado Node.js en tu sistema.

*   **Node.js** (v22 o superior)
*   **pnpm** (opcional pero recomendado):
    ```sh
    # Instalar pnpm globalmente (si no lo tienes instalado)
    npm install -g pnpm
    ```

### Instalación

1.  **Clona el repositorio:**
    ```sh
    git clone https://github.com/omancillav/vet-plan-api.git
    ```

2.  **Navega al directorio del proyecto:**
    ```sh
    cd vet-plan-api
    ```

3.  **Instala las dependencias (recomendado usar pnpm):**
    ```sh
    # Usando pnpm (recomendado)
    pnpm install
    
    # O usando npm
    # npm install
    ```

4.  **Configura las variables de entorno:**
    *   Renombra el archivo `.env.example` a `.env`.
    *   Añade tus credenciales de Supabase y otros valores requeridos en el archivo `.env`.

    ```env
    SUPABASE_URL=TU_SUPABASE_URL
    SUPABASE_KEY=TU_SUPABASE_KEY
    ```

---

## ▶️ Uso

Una vez completada la instalación, puedes iniciar el servidor en modo de desarrollo, que se reiniciará automáticamente con cada cambio.

```sh
# Usando pnpm (recomendado)
pnpm dev

# O usando npm
# npm run dev
```

Para iniciar el servidor en modo de producción:

```sh
# Usando pnpm (recomendado)
pnpm start

# O usando npm
# npm run start
```

---

## Endpoints de la API

La API expone los siguientes recursos. Las rutas marcadas con 🔒 requieren autenticación mediante un token JWT.

*   `/auth`: Rutas para autenticación (login, registro).
*   `/users`: Gestión de usuarios.
*   `/services`: Gestión de servicios ofrecidos.
*   🔒 `/species`: Gestión de especies de mascotas.
*   🔒 `/breeds`: Gestión de razas de mascotas.
*   🔒 `/pets`: Gestión de mascotas (pacientes).
*   🔒 `/vets`: Gestión de veterinarios.
*   🔒 `/schedules`: Gestión de horarios de los veterinarios.
*   🔒 `/categories`: Gestión de categorías de servicios.
*   🔒 `/appointments`: Gestión de citas.

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Consulta el archivo `LICENSE` para más detalles.

---

## ✍️ Autor

*   **Omar Mancilla** - [omancilla](https://github.com/omancillav)
