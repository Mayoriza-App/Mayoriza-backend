# Mayoriza Backend API 🚀

Este es el backend oficial del proyecto **Mayoriza**, construido con [NestJS](https://nestjs.com/) y diseñado para ser altamente escalable y robusto. Actúa como el núcleo de la aplicación, gestionando la base de datos a través de Prisma ORM y la autenticación mediante Supabase.

---

## 🛠️ Tecnologías Principales

- **Framework:** NestJS (Node.js / TypeScript)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** Supabase (Integración y verificación de tokens JWT)
- **Despliegue/Contenedores:** Docker & Docker Compose

---

## 🚀 Configuración y Entornos

El proyecto ha sido configurado para soportar múltiples entornos de forma estricta para evitar accidentes con la base de datos. Usamos `dotenv-cli` para inyectar los archivos correspondientes según el comando que ejecutes.

### 1. Variables de Entorno

Debes crear los siguientes archivos en la raíz del backend (puedes guiarte por `.env.example`):

- **`.env.development`**: Para tu entorno local (Docker Postgres).
- **`.env`**: Para el entorno de producción (Supabase).

Asegúrate de que en el archivo `.env` (Producción) tengas las dos variables de base de datos correctamente configuradas:

```env
# Conexión rápida a Supabase (Pooler: Puerto 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa a Supabase para Migraciones y Push (Session: Puerto 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

---

## 💻 Instrucciones de Ejecución (Desarrollo local)

Este modo levanta la API conectada a tu **base de datos local** gestionada por Docker.

1. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

2. **Levantar la base de datos local:**

   ```bash
   docker-compose up -d postgres
   ```

3. **Sincronizar la base de datos local:**

   ```bash
   pnpm run db:push:local
   ```

4. **Levantar la API en modo Desarrollo:**
   ```bash
   pnpm run start:local
   ```
   _(Este comando usará `.env.development`)_

---

## 🌍 Ejecutar Localmente conectado a Producción (`start:local-prod`)

Si necesitas probar algo en tu máquina local, pero leyendo los **datos reales de Supabase en producción**:

```bash
pnpm run start:local-prod
```

_(Este comando inyectará `.env`)_

---

## 📦 Producción Real

Este comando es el que ejecuta el servidor de **Render** (o cualquier otro hosting) una vez que la aplicación ha sido compilada.

1. **Compilar el proyecto:**

   ```bash
   pnpm run build
   ```

2. **Ejecutar el servidor compilado:**
   ```bash
   pnpm run start:prod
   ```
   _(En producción real, Render inyectará las variables de entorno automáticamente sin necesitar el archivo físico)._

---

## 🗄️ Gestión de Prisma (Base de Datos)

Hemos separado los comandos de Prisma para proteger Producción.

- **Para tu base de datos Local:**

  ```bash
  pnpm run db:push:local    # Enviar esquema
  pnpm run db:studio:local  # Abrir visor de tablas
  ```

- **Para Supabase (Producción):**
  ```bash
  pnpm run db:push:prod     # Enviar esquema a Supabase (Usa DIRECT_URL)
  pnpm run db:studio:prod   # Ver datos de Producción
  ```

### Llenar la base de datos (Seed)

Para ejecutar el script de configuración inicial (Que carga el **Plan Base** de cuentas):

```bash
pnpm exec dotenv -e .env -- prisma db seed
```

---
