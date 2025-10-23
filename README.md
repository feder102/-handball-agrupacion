# -handball-agrupacion

Sistema de gestión para agrupación de handball.

## 📁 Estructura del Proyecto

Este repositorio contiene la aplicación web para gestionar socios, cuotas, pagos y habilitaciones.

### `/web`

Aplicación web responsive desarrollada con **Vite + React Router + Tailwind CSS + TypeScript**, usando **Supabase** como backend-as-a-service (BaaS).

Ver [web/README.md](./web/README.md) para más detalles sobre la configuración y uso.

## 🚀 Inicio Rápido

```bash
cd web
npm install
cp .env_template .env
# Editar .env con tus credenciales de Supabase
npm run dev
```

## 🎯 Características

- ✅ Gestión de Socios
- ✅ Control de Cuotas
- ✅ Registro de Pagos
- ✅ Habilitaciones
- ✅ Sistema RBAC (Control de acceso basado en roles)
- ✅ Diseño Responsive

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v7
- **Estilos**: Tailwind CSS v4
- **Build Tool**: Vite
- **Backend**: Supabase (BaaS)
- **Auth**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
