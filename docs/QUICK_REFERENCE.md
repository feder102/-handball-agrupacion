# ⚡ Quick Reference - Sistema de Registro Automático

> Referencia rápida para desarrolladores. Para documentación completa, ver [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md)

---

## 🎯 En 30 Segundos

**Antes**: Frontend → Auth → Edge Function → DB (3 pasos, 500-1500ms)  
**Ahora**: Frontend → Auth → Trigger → DB (1 paso, 150-400ms) ⚡

**Beneficio**: 3x más rápido, 34% menos código, $0 costos adicionales

---

## 📝 Código Esencial

### Frontend (React/TypeScript)

```typescript
// web/src/lib/auth.ts - registerUser()
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      documento: document,  // ← Obligatorio
      nombre: fullName,
      telefono: phone || null,
      rol: 'socio'  // admin|contador|operador|socio
    }
  }
});
// El trigger crea automáticamente el perfil en public.usuarios
```

### Trigger (PostgreSQL)

```sql
-- supabase_seed.sql (líneas 415-550)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Qué hace**:
1. Extrae `raw_user_meta_data` (documento, nombre, telefono, rol)
2. Valida documento obligatorio
3. Busca rol en `public.roles`
4. Inserta en `public.usuarios` con mismo `id` de `auth.users`

---

## 🚨 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "documento obligatorio" | No enviaste `documento` | Agregar en `options.data` |
| "User already registered" | Email duplicado | Usar otro email o recuperar contraseña |
| "documento ya existe" | Documento duplicado | Usuario existe en `auth.users` pero sin perfil |
| Usuario sin perfil | Error en trigger | Ver logs: Dashboard → Logs → Postgres |

---

## 🔍 Queries Útiles

```sql
-- Ver último usuario registrado
SELECT u.id, u.documento, u.email, u.nombre, r.nombre as rol
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
ORDER BY u.creado_en DESC LIMIT 1;

-- Verificar que id coincide entre auth.users y public.usuarios
SELECT 
  au.id = pu.id as ids_match,
  au.email,
  pu.documento,
  pu.nombre
FROM auth.users au
JOIN public.usuarios pu ON au.id = pu.id
ORDER BY au.created_at DESC LIMIT 1;

-- Buscar usuarios sin perfil
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Limpiar usuarios de prueba
DELETE FROM auth.users WHERE email LIKE 'test-%@example.com';
```

---

## 📂 Archivos Clave

```
📁 handball/
├─ supabase_seed.sql           ⭐ (ejecutar en Supabase)
├─ web/src/lib/auth.ts         ⭐ (código frontend)
├─ web/src/pages/Register.tsx  (UI de registro)
├─ REGISTRO_AUTOMATICO.md      📖 (docs completas)
├─ CHECKLIST_IMPLEMENTACION.md ✅ (paso a paso)
└─ TROUBLESHOOTING.md          🔧 (resolver problemas)
```

---

## ✅ Checklist Ultra-Rápido

- [ ] Ejecutar `supabase_seed.sql` en Supabase SQL Editor
- [ ] Verificar trigger existe: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
- [ ] Verificar 4 roles existen: `SELECT * FROM public.roles`
- [ ] Configurar `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Probar registro desde `/register`
- [ ] Verificar usuario en ambas tablas (auth.users y public.usuarios)

---

## 🧪 Test Rápido

```powershell
# 1. Terminal
cd web
npm run dev

# 2. Browser
# Navegar a http://localhost:3002/register
# Completar formulario con datos únicos
# Verificar mensaje de éxito

# 3. Supabase SQL Editor
SELECT * FROM public.usuarios ORDER BY creado_en DESC LIMIT 1;
# Debe aparecer el usuario recién creado
```

---

## 🎓 Conceptos Clave

- **Trigger**: Función que se ejecuta automáticamente al INSERT en `auth.users`
- **raw_user_meta_data**: JSON donde se guardan los datos del signup
- **1:1 Relation**: Mismo UUID en `auth.users.id` y `public.usuarios.id`
- **SECURITY DEFINER**: El trigger tiene privilegios elevados controlados
- **RLS**: Row Level Security controla qué usuarios ven qué datos

---

## 📊 Performance

| Métrica | Valor |
|---------|-------|
| Tiempo de registro | 150-400ms |
| Round-trips HTTP | 1 |
| Complejidad | Baja |
| Costos adicionales | $0 |

---

## 🔗 Links Rápidos

- [📑 Índice Completo](./INDICE_DOCUMENTACION.md)
- [📖 Docs Completas](./REGISTRO_AUTOMATICO.md)
- [✅ Checklist](./CHECKLIST_IMPLEMENTACION.md)
- [🔧 Troubleshooting](./TROUBLESHOOTING.md)
- [🎨 Diagramas](./DIAGRAMAS.md)
- [🧪 Tests](./test_trigger.sql)

---

## 💡 Tips Pro

1. **Validá documento en frontend** antes de llamar signUp
2. **Usa documentos únicos** reales (no hardcodees)
3. **Revisá logs de PostgreSQL** si algo falla
4. **Probá con usuarios de prueba** antes de producción
5. **Limpiá usuarios de prueba** después: `DELETE FROM auth.users WHERE email LIKE 'test-%'`

---

## 🆘 Ayuda Rápida

```
¿No funciona? → TROUBLESHOOTING.md
¿Cómo implementar? → CHECKLIST_IMPLEMENTACION.md
¿Cómo funciona? → REGISTRO_AUTOMATICO.md
¿Qué cambió? → ARQUITECTURA_CAMBIOS.md
¿Cómo se ve? → DIAGRAMAS.md
```

---

**¿Necesitás más detalles?** → [`INDICE_DOCUMENTACION.md`](./INDICE_DOCUMENTACION.md)

---

*Última actualización: Octubre 2025*
