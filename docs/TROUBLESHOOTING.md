# 🔧 Troubleshooting - Sistema de Registro Automático

## 🚨 Problemas Comunes y Soluciones

### 1. ❌ Error: "El documento es obligatorio en raw_user_meta_data"

**Síntoma**: El registro falla con este mensaje.

**Causa**: El frontend no está enviando el campo `documento` en el `raw_user_meta_data` o está vacío.

**Solución**:
```typescript
// Verificá que en tu código de registro estés enviando:
await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      documento: document.trim(), // ← Asegurate de que esto NO esté vacío
      nombre: fullName,
      telefono: phone || null,
      rol: 'socio'
    }
  }
});
```

---

### 2. ❌ Error: "Documento ya existe para otro usuario"

**Síntoma**: El usuario se crea en `auth.users` pero no aparece en `public.usuarios`.

**Causa**: Ya existe otro usuario con ese documento en la base de datos.

**Solución**:

1. Verificar usuarios duplicados:
```sql
SELECT id, documento, email, nombre
FROM public.usuarios
WHERE documento = '12345678'; -- Reemplazá con el documento en cuestión
```

2. Si el documento está duplicado por error, eliminá el usuario viejo:
```sql
-- Esto también lo eliminará de auth.users (CASCADE)
DELETE FROM public.usuarios WHERE documento = '12345678';
```

3. Si el documento le pertenece legítimamente a otro usuario, el nuevo usuario debe usar un documento diferente.

---

### 3. ❌ Error: "User already registered"

**Síntoma**: Supabase rechaza el signup antes de que el trigger se ejecute.

**Causa**: Ya existe un usuario en `auth.users` con ese email.

**Solución**:

1. Verificar si el email existe:
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'usuario@example.com';
```

2. Si es un usuario válido, usar la función de "recuperar contraseña" en lugar de registrarse nuevamente.

3. Si es un usuario de prueba que querés eliminar:
```sql
DELETE FROM auth.users WHERE email = 'usuario@example.com';
```

---

### 4. 🔍 El usuario se crea en `auth.users` pero NO en `public.usuarios`

**Síntoma**: Después del signup, el usuario existe en `auth.users` pero no en `public.usuarios`.

**Posibles causas**:

#### A) El trigger no está activo

Verificar:
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

Si `tgenabled` es `D` (disabled) o no aparece nada, re-crear el trigger:
```sql
-- Ejecutá la sección 13 del supabase_seed.sql nuevamente
```

#### B) Error en la función del trigger

Ver logs de PostgreSQL en Supabase:
1. Andá a Dashboard → Logs → Postgres Logs
2. Buscá errores relacionados con `handle_new_user`

#### C) El documento está duplicado

El trigger captura la excepción y loguea un warning pero no falla el signup. Verificá:
```sql
SELECT documento, count(*) 
FROM public.usuarios 
GROUP BY documento 
HAVING count(*) > 1;
```

---

### 5. 🐌 El registro es muy lento

**Síntoma**: El signup tarda más de 2-3 segundos.

**Causa**: El trigger está correctamente configurado pero puede haber índices faltantes o queries lentas.

**Solución**:

1. Verificar índices:
```sql
-- Estos índices deberían existir
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'roles');
```

Esperado:
- `usuarios_pkey` (PK en id)
- `usuarios_documento_key` (UNIQUE en documento)
- `usuarios_email_key` (UNIQUE en email)
- `usuarios_rol_idx` (INDEX en rol_id)
- `roles_pkey` (PK en id)
- `roles_nombre_key` (UNIQUE en nombre)

2. Si faltan, re-ejecutá el seed completo.

---

### 6. 🔐 Error: "new row violates row-level security policy"

**Síntoma**: Error al intentar leer datos de `public.usuarios` después del signup.

**Causa**: Las políticas RLS no permiten al usuario leer su propio registro.

**Solución**:

Verificar que exista la política `usuarios_select_self`:
```sql
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'usuarios' AND policyname = 'usuarios_select_self';
```

Si no existe, re-crear:
```sql
create policy usuarios_select_self
on public.usuarios for select
to authenticated
using (id = auth.uid());
```

---

### 7. 🧪 Cómo depurar el trigger paso a paso

Para ver exactamente qué está pasando dentro del trigger:

1. **Agregar RAISE NOTICE al trigger** (temporal, solo para debug):
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_rol_id smallint;
  v_rol_nombre text;
  v_documento text;
  v_nombre text;
  v_telefono text;
begin
  -- Extraer metadata
  v_documento := coalesce(new.raw_user_meta_data->>'documento', '');
  v_nombre := coalesce(new.raw_user_meta_data->>'nombre', new.email);
  v_telefono := new.raw_user_meta_data->>'telefono';
  v_rol_nombre := coalesce(new.raw_user_meta_data->>'rol', 'socio');

  -- DEBUG: ver qué datos se extrajeron
  RAISE NOTICE 'Documento: %, Nombre: %, Rol: %', v_documento, v_nombre, v_rol_nombre;

  -- ... resto del código ...
  
  return new;
end;
$$;
```

2. **Ver los logs en Supabase**:
   - Dashboard → Logs → Postgres Logs
   - Buscá mensajes de tipo `NOTICE`

3. **Remover los RAISE NOTICE después de depurar** (afectan performance).

---

### 8. 📧 El usuario debe confirmar email pero el registro en `public.usuarios` no se crea

**Síntoma**: Supabase requiere confirmación de email (`requiresEmailConfirmation: true`) pero no se crea el perfil.

**Causa**: El trigger se ejecuta correctamente pero falló por alguna validación (ej: documento duplicado).

**Solución**:

El trigger está configurado para NO fallar el signup si hay errores (solo loguea warnings). Esto significa:
- El usuario se crea en `auth.users`
- El registro en `public.usuarios` NO se crea si hay error
- El usuario puede confirmar su email pero no tendrá perfil

**Recomendación**: 
- Validar documentos únicos desde el frontend ANTES de llamar a `signUp()`
- Agregar un endpoint manual para "recuperar" perfiles faltantes si es necesario

---

### 9. 🗂️ Cómo ver todos los usuarios con y sin perfil

```sql
SELECT 
  au.id,
  au.email as auth_email,
  au.created_at as auth_created,
  pu.documento,
  pu.nombre,
  pu.email as public_email,
  CASE 
    WHEN pu.id IS NULL THEN '❌ Sin perfil'
    ELSE '✅ Con perfil'
  END as status
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.id = pu.id
ORDER BY au.created_at DESC;
```

---

### 10. 🔄 Cómo re-ejecutar el trigger para un usuario existente

Si tenés usuarios en `auth.users` que no tienen perfil en `public.usuarios`:

**Opción A: Usar la función RPC manualmente (requiere SERVICE_ROLE)**

Desde el SQL Editor:
```sql
SELECT public.create_usuario(
  '<auth-user-id>'::uuid,
  '12345678',              -- documento
  'usuario@example.com',    -- email
  'Nombre Completo',        -- nombre
  '+5491123456789',         -- telefono (opcional)
  'socio'                   -- rol
);
```

**Opción B: Re-crear el usuario** (solo si es seguro hacerlo)

```sql
-- 1. Guardar el ID del usuario
SELECT id FROM auth.users WHERE email = 'usuario@example.com';

-- 2. Eliminar el usuario (esto también elimina de public.usuarios por CASCADE)
DELETE FROM auth.users WHERE email = 'usuario@example.com';

-- 3. Pedir al usuario que se registre nuevamente desde el frontend
-- El trigger se ejecutará automáticamente esta vez
```

---

## 📋 Checklist de Diagnóstico

Cuando algo no funciona, seguí este checklist:

- [ ] ¿Ejecutaste `supabase_seed.sql` completo en tu proyecto de Supabase?
- [ ] ¿El trigger `on_auth_user_created` existe y está habilitado?
- [ ] ¿La función `handle_new_user` existe?
- [ ] ¿Los 4 roles (admin, contador, operador, socio) existen en `public.roles`?
- [ ] ¿Las tablas `public.usuarios` y `public.roles` existen?
- [ ] ¿El frontend envía `documento` en `options.data` del signUp?
- [ ] ¿El documento es único (no existe otro usuario con ese documento)?
- [ ] ¿El email es único (no existe otro usuario con ese email)?
- [ ] ¿Las políticas RLS permiten al usuario leer su propio registro?
- [ ] ¿Verificaste los logs de PostgreSQL en Supabase Dashboard?

---

## 🆘 Obtener Ayuda

Si seguiste todos estos pasos y aún tenés problemas:

1. **Ejecutá el script de prueba**: `test_trigger.sql`
2. **Copiá los logs de error** de Supabase Dashboard → Logs
3. **Exportá la estructura de tu base de datos**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

4. **Compartí el error exacto** y los resultados de las queries anteriores.

---

💡 **Tip**: La mayoría de los problemas se resuelven verificando que el `documento` se esté enviando correctamente y que no esté duplicado.
