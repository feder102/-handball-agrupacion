# 🏐 Hamburg Handball Frontend

Aplicación web responsive construida sobre **Vite + React + TypeScript + TailwindCSS**, respaldada íntegramente por **Supabase** (PostgreSQL + Auth + Realtime) sin necesidad de un backend propio. El objetivo es centralizar la gestión de socios, cuotas, pagos y reportes de la agrupación de handball.

## 🚀 Arquitectura y stack

- **Vite** como bundler y dev-server (port 3002).
- **React 18** con **React Router** para la navegación.
- **TailwindCSS + tailwindcss-animate** para estilos reutilizando el diseño del template HTML adjunto.
- **Supabase JS v2** para autenticación, acceso a base de datos y eventos en tiempo real.
- **Vitest + Testing Library** para pruebas unitarias.
- **ESLint + Prettier** bajo configuración flat.

## ✨ Funcionalidades clave

- Registro de usuarios con flujo guiado y testimonios (basado en el template `template/full/register.html`).
- Gestión de socios, periodos y cuotas con estados `pendiente`, `pagado`, `vencido` y `rechazado`.
- Registro de pagos y panel de reportes con métricas rápidas (`reportes_view`).
- Roles de aplicación (`admin`, `contador`, `operador`, `socio`) con helpers de RBAC.
- Integración directa con Supabase sin servidor intermedio y sincronización en vivo mediante hooks personalizados.

## 🗂️ Estructura del repositorio

```
handball/
├─ README.md
├─ supabase_seed.sql
├─ reglas/
│  └─ dev-frontend.txt
└─ web/
   ├─ package.json
   ├─ index.html
   ├─ src/
   │  ├─ App.tsx
   │  ├─ routes.tsx
   │  ├─ pages/
   │  │  ├─ Home.tsx
   │  │  ├─ Register.tsx
   │  │  └─ ...
   │  ├─ components/
   │  ├─ hooks/
   │  ├─ lib/
   │  │  ├─ supabase.ts
   │  │  ├─ auth.ts
   │  │  └─ rbac.ts
   │  └─ assets/
   │     └─ images/
   ├─ tailwind.config.ts
   ├─ vite.config.ts
   ├─ eslint.config.js
   ├─ postcss.config.cjs
   ├─ tsconfig.json
   └─ vitest.setup.ts
```

> ℹ️ Reutilizá siempre los estilos y patrones del template en `template/full`. Si necesitás un asset, copialo primero dentro de `web/src/assets` (o `web/dist/assets` para builds estáticas) antes de referenciarlo.

## 🛠️ Preparación del entorno

1. Instalá dependencias:

```powershell
cd web
npm install
```

2. Duplicá el archivo de entorno y completá tus credenciales de Supabase:

```powershell
Copy-Item .env.example .env.local
```

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. Ejecutá el seed dentro del **Supabase SQL Editor** para crear tablas, vistas, triggers, políticas e índices:

```sql
-- abre supabase_seed.sql y ejecútalo completo
```

El script define las tablas `socios`, `periodos`, `cuotas_socios`, `pagos`, `usuarios`, `auditoria`, configura el trigger `set_periodo_text`, la función `dashboard_stats`, la vista `reportes_view`, políticas RLS de solo lectura y datos iniciales.

## 🧑‍💻 Flujo de desarrollo local

- **Servidor de desarrollo**:

```powershell
npm run dev
```

Vite se levantará en `http://localhost:3002/`.

- **Linting**: `npm run lint`
- **Pruebas unitarias**: `npm run test`
- **Build de producción**: `npm run build`

## 🔐 Autenticación y Supabase

- Autenticación mediante `supabase.auth` (email/contraseña o magic link).
- Helper `registerUser` inserta en Supabase Auth y sincroniza con las tablas `socios` y `usuarios`.
- Políticas RLS habilitadas para lecturas de usuarios autenticados; ajustá según tus necesidades.
- Para desarrollar sin backend adicional, todo acceso a datos se realiza con el **anon key** desde el cliente. Caso de requerir operaciones privilegiadas, migrá a Edge Functions o Service Role desde entornos seguros.

## 🎨 Lineamientos de UI

- Usa clases Tailwind y componentes inspirados en el template HTML provisto.
- Mantén accesibilidad (tabindex, aria-label, `handle*` en eventos, early returns).
- Centraliza assets en `web/src/assets` para mantener consistencia entre desarrollo y build.

## 🚢 Deploy sugerido (Vercel)

1. Crea un nuevo proyecto importando el repo y seleccionando `/web` como directorio raíz.
2. Define variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en _Project Settings_.
3. Despliega y, opcionalmente, configura un dominio personalizado.

## 📚 Documentación adicional

- **Guía de desarrollo detallada**: `reglas/dev-frontend.txt` (lineamientos de código).
- **Resumen técnico del proyecto**: consulta `PROJECT_OVERVIEW.txt` para entender a fondo el rol de Vite, Supabase y la configuración.

---

¿Dudas o propuestas? Abrí un issue y seguimos iterando 💬## 🧾 **README — Hamburg Frontend (Vite + React + Tailwind + Supabase)**

### 1️⃣ Descripción general

Aplicación web responsive desarrollada con **Vite + React Router + Tailwind + TypeScript**, usando **Supabase** como backend-as-a-service (BaaS). Permite gestionar socios, cuotas, pagos y habilitaciones sin necesidad de servidor intermedio.

### 2️⃣ Arquitectura

* **Frontend:** Vite + React + TypeScript + TailwindCSS
* **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
* **Autenticación:** Supabase Auth (email/password o magic link)
* **Hosting:** Vercel (recomendado)
* **Infraestructura costo cero:** todos los componentes usan los planes gratuitos.

### 3️⃣ Estructura del proyecto

```
/web/
├─ src/
│  ├─ pages/
│  ├─ components/
│  ├─ lib/
│  │  ├─ supabase.ts
│  │  └─ rbac.ts
│  ├─ hooks/
│  └─ routes.tsx
├─ .env.example
├─ tailwind.config.ts
└─ package.json
```

### 4️⃣ Configuración del entorno

Copiá `.env.example` a `.env.local` dentro de `/web` y completá tus credenciales de Supabase:

```bash
cp web/.env.example web/.env.local
```

**.env.local**

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**src/lib/supabase.ts**

```ts
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL!,
	import.meta.env.VITE_SUPABASE_ANON_KEY!,
	{ auth: { persistSession: true, autoRefreshToken: true } }
)
```

### 5️⃣ Autenticación

Usa el sistema nativo de Supabase:

```ts
await supabase.auth.signInWithPassword({ email, password })
```

Los usuarios se gestionan en la tabla `usuarios` del schema `public` con sus roles (`admin`, `contador`, `operador`, `socio`). Las políticas RLS deben reflejar estos perfiles.

### 6️⃣ Base de datos

Todo se maneja directamente en **Supabase SQL Editor** con tablas:

* `socios`
* `periodos`
* `cuotas_socios`
* `pagos`
* `usuarios`
* `auditoria`

Incluímos el archivo [`supabase_seed.sql`](./supabase_seed.sql) con una estructura mínima (tablas, vistas, triggers y datos demo) para iniciar el proyecto. Ejecutalo una sola vez desde el editor SQL de Supabase.

### 7️⃣ Funcionalidades MVP

✅ Alta de socios  
✅ Visualización de cuotas  
✅ Pago manual o registrado  
✅ Control de habilitación  
✅ Panel para contador (ver pagos)  
✅ Reportes y estadísticas (morosos, al día, totales)  
✅ Auth Supabase con roles y políticas RLS

### 8️⃣ Deploy

1. Subí el repo a GitHub.
2. En **Vercel** → “Import Project” → seleccioná `/web`.
3. Agregá las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Deploy listo en minutos.

### 9️⃣ Costos estimados

* Supabase: **free tier** (perfecto para MVP)
* Vercel: **gratis**
* Dominio: opcional (≈ USD 1/mes)

### 🔧 Desarrollo local

```bash
cd web
npm install
npm run dev
```

* `npm run lint` — verificación con ESLint.  
* `npm run test` — pruebas unitarias con Vitest + Testing Library.  
* `npm run build` — compila para producción.

### 10️⃣ Futuras mejoras

* Roles y permisos refinados (RLS policies)
* Notificaciones email automáticas (Edge Function Supabase)
* Dashboard estadístico con gráficas
* Integración con Mercado Pago vía **Supabase Edge Function** (opcional, sin backend propio)

---

¿Necesitás soporte extra? Escribime y seguimos iterando juntos 🏐