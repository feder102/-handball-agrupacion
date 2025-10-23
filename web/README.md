# Handball Agrupación - Web Application

Aplicación web responsive desarrollada con **Vite + React Router + Tailwind CSS + TypeScript**, usando **Supabase** como backend-as-a-service (BaaS).

## 🎯 Características

- **Gestión de Socios**: Administración de miembros de la agrupación
- **Cuotas**: Control de cuotas mensuales
- **Pagos**: Registro y seguimiento de pagos
- **Habilitaciones**: Estado de habilitaciones de los socios
- **RBAC**: Sistema de control de acceso basado en roles (admin, socio, guest)
- **Responsive**: Diseño adaptable a diferentes dispositivos

## 🏗️ Estructura del Proyecto

```
/web/
├─ src/
│  ├─ pages/              # Páginas de la aplicación
│  │  ├─ HomePage.tsx
│  │  ├─ SociosPage.tsx
│  │  ├─ CuotasPage.tsx
│  │  ├─ PagosPage.tsx
│  │  └─ HabilitacionesPage.tsx
│  ├─ components/         # Componentes reutilizables
│  │  └─ Layout.tsx
│  ├─ lib/               # Librerías y utilidades
│  │  ├─ supabase.ts    # Cliente de Supabase
│  │  └─ rbac.ts        # Sistema de roles y permisos
│  ├─ hooks/             # Custom React Hooks
│  │  └─ useAuth.ts
│  └─ routes.tsx         # Configuración de rutas
├─ .env_template         # Template de variables de entorno
├─ tailwind.config.ts    # Configuración de Tailwind CSS
└─ package.json
```

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env_template .env
```

3. Editar `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Para obtener estas credenciales:
- Ir a [https://app.supabase.com](https://app.supabase.com)
- Crear un nuevo proyecto o seleccionar uno existente
- Ir a Settings → API
- Copiar la URL del proyecto y la clave anónima (anon key)

## 🛠️ Desarrollo

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Build

Construir para producción:
```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🔍 Linting

Ejecutar el linter:
```bash
npm run lint
```

## 👁️ Preview

Previsualizar el build de producción:
```bash
npm run preview
```

## 🗄️ Configuración de Supabase

### Tablas requeridas

Para que la aplicación funcione correctamente, necesitas crear las siguientes tablas en Supabase:

#### `socios` (Socios/Miembros)
```sql
create table socios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  telefono text,
  fecha_ingreso date default current_date,
  estado text default 'activo',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `cuotas` (Cuotas)
```sql
create table cuotas (
  id uuid primary key default gen_random_uuid(),
  periodo text not null, -- e.g., "2025-01"
  monto decimal(10,2) not null,
  fecha_vencimiento date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `pagos` (Pagos)
```sql
create table pagos (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid references socios(id) on delete cascade,
  cuota_id uuid references cuotas(id) on delete cascade,
  monto decimal(10,2) not null,
  fecha_pago date not null,
  metodo_pago text,
  estado text default 'confirmado',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `habilitaciones` (Habilitaciones)
```sql
create table habilitaciones (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid references socios(id) on delete cascade,
  estado text default 'habilitado',
  fecha_vencimiento date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Row Level Security (RLS)

Se recomienda habilitar RLS para mayor seguridad:

```sql
-- Habilitar RLS
alter table socios enable row level security;
alter table cuotas enable row level security;
alter table pagos enable row level security;
alter table habilitaciones enable row level security;

-- Políticas de ejemplo (ajustar según necesidades)
-- Permitir lectura a usuarios autenticados
create policy "Permitir lectura a usuarios autenticados"
  on socios for select
  to authenticated
  using (true);

-- Permitir escritura solo a admins
-- (requiere configurar metadata de usuario con rol)
```

## 🔐 Sistema de Roles (RBAC)

La aplicación incluye un sistema de control de acceso basado en roles:

- **admin**: Acceso completo a todas las funcionalidades
- **socio**: Acceso limitado a visualizar datos propios
- **guest**: Sin autenticación, acceso limitado

Los roles se gestionan mediante el metadata del usuario en Supabase.

## 🎨 Tailwind CSS

La aplicación usa Tailwind CSS v4 para los estilos. La configuración está en `tailwind.config.ts`.

## 📱 Responsive Design

La aplicación está diseñada para funcionar en diferentes dispositivos:
- 📱 Mobile (sm: 640px)
- 💻 Tablet (md: 768px)
- 🖥️ Desktop (lg: 1024px, xl: 1280px)

## 🛡️ TypeScript

El proyecto está completamente tipado con TypeScript para mayor seguridad y mejor experiencia de desarrollo.

## 📄 Licencia

Este proyecto es privado y de uso interno.
